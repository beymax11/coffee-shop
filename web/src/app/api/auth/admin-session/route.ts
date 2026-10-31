import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  generateAdminTokens,
  registerActiveSession,
  isSessionActive,
  revokeActiveSession,
  getActiveSessionId,
  verifyToken,
} from "@/lib/admin-auth";
import { getClientIp, enforceRateLimit } from "@/lib/rate-limit";
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
  const rateLimitResponse = enforceRateLimit(req, "auth-admin-session", 15, 300);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
      role: validatedRole,
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
      `admin_access_token=${tokens.accessToken}; Path=/; Max-Age=900; HttpOnly; SameSite=Lax${secureFlag}`
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
      `admin_role=${validatedRole}; Path=/; Max-Age=604800; SameSite=Lax${secureFlag}`
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
 * Checks if a specific sessionId is still active and returns the server-verified role.
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

  let verifiedRole: "admin" | "barista" | undefined;
  const tokenCookie =
    req.cookies.get("admin_access_token")?.value ||
    req.cookies.get("admin_refresh_token")?.value;

  if (tokenCookie) {
    const verified = verifyToken(tokenCookie);
    if (
      verified.valid &&
      verified.payload &&
      verified.payload.email.toLowerCase().trim() === normalizedEmail
    ) {
      verifiedRole = verified.payload.role;
    }
  }

  return NextResponse.json({
    active,
    ...(verifiedRole ? { role: verifiedRole } : {}),
  });
}

/**
 * DELETE /api/auth/admin-session
 * Logs out and revokes active session (requires ownership of the session).
 */
export async function DELETE(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    const tokenCookie =
      req.cookies.get("admin_access_token")?.value ||
      req.cookies.get("admin_refresh_token")?.value;
    const cookieSessionId = req.cookies.get("admin_session_id")?.value;
    const activeSessionId = getActiveSessionId(normalizedEmail);

    let canRevoke = false;
    if (tokenCookie) {
      const verified = verifyToken(tokenCookie);
      if (
        verified.valid &&
        verified.payload &&
        verified.payload.email.toLowerCase().trim() === normalizedEmail
      ) {
        canRevoke = true;
      }
    }
    if (!canRevoke && cookieSessionId && activeSessionId && cookieSessionId === activeSessionId) {
      canRevoke = true;
    }

    if (canRevoke) {
      revokeActiveSession(normalizedEmail);
    }
  }

  const res = NextResponse.json({ success: true });
  res.headers.append("Set-Cookie", "admin_access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.headers.append("Set-Cookie", "admin_refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.headers.append("Set-Cookie", "admin_session_id=; Path=/; Max-Age=0; SameSite=Lax");
  res.headers.append("Set-Cookie", "admin_session=; Path=/; Max-Age=0; SameSite=Lax");
  res.headers.append("Set-Cookie", "admin_role=; Path=/; Max-Age=0; SameSite=Lax");

  return res;
}
