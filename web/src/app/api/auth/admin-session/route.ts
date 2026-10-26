import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  generateAdminTokens,
  registerActiveSession,
  isSessionActive,
  revokeActiveSession,
  getActiveSessionId,
} from "@/lib/admin-auth";
import { getClientIp } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Broadcasts kickout event to Supabase Realtime channel
 * so any other connected tab or device receives the push instantly.
 */
async function broadcastKickout(email: string, newSessionId: string) {
  try {
    const key = serviceKey || supabaseAnonKey;
    if (supabaseUrl && key) {
      const supabase = createClient(supabaseUrl, key);
      const channel = supabase.channel("admin-session-channel");
      const payloadData = {
        email: email.toLowerCase().trim(),
        newSessionId,
        timestamp: Date.now(),
      };

      if (typeof channel.httpSend === "function") {
        await channel.httpSend("KICKOUT", payloadData);
      } else {
        await channel.send({
          type: "broadcast",
          event: "KICKOUT",
          payload: payloadData,
        });
      }
      await supabase.removeChannel(channel);
    }
  } catch (err) {
    console.error("[Admin Session] Error broadcasting realtime kickout:", err);
  }
}

/**
 * POST /api/auth/admin-session
 * Initializes a new single active session for an admin.
 * Kicks out any prior active session.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, role, accessToken: bodyToken } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let validatedRole: "admin" | "barista" = role === "barista" ? "barista" : "admin";
    let validatedUserId = userId || "admin-user";

    // 0. Security Verification: Ensure the requester possesses an authentic session and staff permissions
    const isProduction = process.env.NODE_ENV === "production";
    const token =
      bodyToken ||
      req.cookies.get("sb-access-token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (supabaseUrl && (serviceKey || supabaseAnonKey)) {
      if (token) {
        const activeKey = serviceKey || supabaseAnonKey!;
        const supabase = createClient(supabaseUrl, activeKey);
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
          return NextResponse.json(
            { error: "Unauthorized. Invalid or expired authentication session." },
            { status: 401 }
          );
        }

        // Verify token matches requested email
        if (user.email && user.email.toLowerCase().trim() !== normalizedEmail) {
          return NextResponse.json(
            { error: "Forbidden. Email mismatch with authentication session." },
            { status: 403 }
          );
        }

        validatedUserId = user.id;

        // Verify staff role in profiles table or admin email config
        const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const emailMatchesAdmin = Boolean(
          configuredAdminEmail &&
            user.email &&
            user.email.toLowerCase() === configuredAdminEmail.toLowerCase()
        );

        let userRole: "admin" | "barista" | null = null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin" || profile?.role === "barista") {
          userRole = profile.role;
        } else if (emailMatchesAdmin) {
          userRole = "admin";
        } else if (user.app_metadata?.role === "admin" || user.app_metadata?.role === "barista") {
          userRole = user.app_metadata.role;
        }

        if (!userRole) {
          return NextResponse.json(
            { error: "Forbidden. This account is not authorized for staff access." },
            { status: 403 }
          );
        }

        validatedRole = userRole;
      } else {
        // No token provided: strictly forbid in production
        if (isProduction) {
          return NextResponse.json(
            { error: "Unauthorized. Active authentication session is required." },
            { status: 401 }
          );
        }

        // Development mock mode fallback
        const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "antonioni.grounds@gmail.com";
        const isMockStaff =
          normalizedEmail === configuredAdminEmail.toLowerCase() ||
          normalizedEmail === "barista@coffee.com" ||
          normalizedEmail === "admin@agshop.lat" ||
          normalizedEmail === "admin@coffee.com" ||
          req.cookies.get("admin_session")?.value === "true";

        if (!isMockStaff) {
          return NextResponse.json(
            { error: "Forbidden. Staff account required." },
            { status: 403 }
          );
        }
      }
    } else if (isProduction) {
      return NextResponse.json(
        { error: "Database configuration unavailable." },
        { status: 503 }
      );
    }

    const sessionId = crypto.randomUUID();
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    // 1. Register this as the sole active session
    registerActiveSession(normalizedEmail, sessionId, { clientIp, userAgent });

    // 2. Broadcast kickout to all other devices/tabs in real-time
    await broadcastKickout(normalizedEmail, sessionId);

    // 3. Generate 15-minute access token and 7-day refresh token
    const tokens = generateAdminTokens({
      userId: validatedUserId,
      email: normalizedEmail,
      role: validatedRole,
      sessionId,
    });

    const res = NextResponse.json({
      success: true,
      sessionId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresAt: tokens.accessExpiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
    });

    // 4. Set secure cookies
    const secureFlag = isProduction ? "; Secure" : "";

    // 15-minute access token (900 seconds)
    res.headers.append(
      "Set-Cookie",
      `admin_access_token=${tokens.accessToken}; Path=/; Max-Age=900; SameSite=Lax${secureFlag}`
    );

    // 7-day refresh token (604800 seconds)
    res.headers.append(
      "Set-Cookie",
      `admin_refresh_token=${tokens.refreshToken}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${secureFlag}`
    );

    // Session identifier cookie for fast client-side & middleware inspection
    res.headers.append(
      "Set-Cookie",
      `admin_session_id=${sessionId}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
    );

    res.headers.append(
      "Set-Cookie",
      `admin_session=true; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
    );

    res.headers.append(
      "Set-Cookie",
      `admin_role=${role}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
    );

    return res;
  } catch (err) {
    console.error("POST /api/auth/admin-session error:", err);
    return NextResponse.json(
      { error: "Failed to establish admin session." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/admin-session
 * Checks if a specific sessionId is still active.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email =
    searchParams.get("email") ||
    req.cookies.get("admin_email")?.value;
  const sessionId =
    searchParams.get("sessionId") ||
    req.cookies.get("admin_session_id")?.value;

  if (!email || !sessionId) {
    return NextResponse.json(
      { error: "Email and sessionId are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const active = isSessionActive(normalizedEmail, sessionId);
  const currentActiveSessionId = getActiveSessionId(normalizedEmail);

  return NextResponse.json({
    active,
    currentActiveSessionId,
  });
}

/**
 * DELETE /api/auth/admin-session
 * Logs out and revokes active session.
 */
export async function DELETE(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (email) {
    revokeActiveSession(email);
  }

  const res = NextResponse.json({ success: true });
  res.headers.append("Set-Cookie", "admin_access_token=; Path=/; Max-Age=0");
  res.headers.append("Set-Cookie", "admin_refresh_token=; Path=/; Max-Age=0");
  res.headers.append("Set-Cookie", "admin_session_id=; Path=/; Max-Age=0");
  res.headers.append("Set-Cookie", "admin_session=; Path=/; Max-Age=0");
  res.headers.append("Set-Cookie", "admin_role=; Path=/; Max-Age=0");

  return res;
}
