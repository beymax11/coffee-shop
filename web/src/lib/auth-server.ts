import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken, isSessionActive } from "./admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface AuthContext {
  userId: string | null;
  email: string | null;
  phone: string | null;
  role: "admin" | "barista" | "customer" | null;
  isStaff: boolean;
  isAdmin: boolean;
  isMock: boolean;
  sessionId?: string;
}

/**
 * Validates the caller's identity and role on the server side.
 * Supports:
 * 1. Admin 15-minute access token with single active session verification.
 * 2. Supabase JWT auth session.
 * 3. Development / Mock mode fallback.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext> {
  // 1. Check for 15-minute Admin Access Token
  const adminAccessToken =
    req.cookies.get("admin_access_token")?.value ||
    req.headers.get("x-admin-access-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (adminAccessToken) {
    const verified = verifyToken(adminAccessToken);
    if (verified.valid && verified.payload && verified.payload.type === "access") {
      const { userId, email, role, sessionId } = verified.payload;

      // Verify that this session has NOT been superseded by another login (Single Active Session)
      const active = isSessionActive(email, sessionId);
      if (active) {
        return {
          userId,
          email,
          phone: null,
          role,
          isStaff: role === "admin" || role === "barista",
          isAdmin: role === "admin",
          isMock: false,
          sessionId,
        };
      } else {
        console.warn(`[Auth Server] Rejected token for ${email}: Session ${sessionId} has been superseded.`);
        return {
          userId: null,
          email: null,
          phone: null,
          role: null,
          isStaff: false,
          isAdmin: false,
          isMock: false,
        };
      }
    } else {
      console.warn(`[Auth Server] Invalid or expired admin token: ${verified.error}`);
      return {
        userId: null,
        email: null,
        phone: null,
        role: null,
        isStaff: false,
        isAdmin: false,
        isMock: false,
      };
    }
  }

  // 2. Real Supabase Authentication
  const token =
    req.cookies.get("sb-access-token")?.value ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (supabaseUrl && (serviceKey || supabaseAnonKey) && token) {
    try {
      const activeKey = serviceKey || supabaseAnonKey!;
      const supabase = createClient(supabaseUrl, activeKey);

      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (!userError && user) {
        const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const emailMatchesAdmin = Boolean(
          configuredAdminEmail &&
            user.email &&
            user.email.toLowerCase() === configuredAdminEmail.toLowerCase()
        );

        // Check role in profiles table
        let role: "admin" | "barista" | "customer" = "customer";

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin" || profile?.role === "barista") {
          role = profile.role;
        } else if (emailMatchesAdmin) {
          role = "admin";
        } else if (user.app_metadata?.role === "admin" || user.app_metadata?.role === "barista") {
          role = user.app_metadata.role;
        }

        return {
          userId: user.id,
          email: user.email || null,
          phone: user.phone || null,
          role,
          isStaff: role === "admin" || role === "barista",
          isAdmin: role === "admin",
          isMock: false,
        };
      }
    } catch (err) {
      console.error("[Auth Server] Error verifying Supabase token:", err);
    }
  }

  // 3. Development / Mock Mode Fallback (Strictly prohibited in production)
  const isDev = process.env.NODE_ENV !== "production";
  const adminSession = req.cookies.get("admin_session")?.value;
  const adminRoleCookie = req.cookies.get("admin_role")?.value;

  if (isDev && adminSession === "true") {
    const role = adminRoleCookie === "barista" ? "barista" : "admin";
    return {
      userId: "mock-admin-id",
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@agshop.lat",
      phone: null,
      role,
      isStaff: true,
      isAdmin: role === "admin",
      isMock: true,
    };
  }

  return {
    userId: null,
    email: null,
    phone: null,
    role: null,
    isStaff: false,
    isAdmin: false,
    isMock: false,
  };
}

/**
 * Require the caller to be a staff member (Admin or Barista).
 * Returns AuthContext if authorized, or a 401/403 NextResponse if denied.
 */
export async function requireStaff(
  req: NextRequest
): Promise<{ auth: AuthContext } | { response: NextResponse }> {
  const auth = await getAuthContext(req);

  if (!auth.isStaff) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized. Staff access required." },
        { status: 401 }
      ),
    };
  }

  return { auth };
}

/**
 * Require the caller to be an Administrator.
 * Returns AuthContext if authorized, or a 401/403 NextResponse if denied.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<{ auth: AuthContext } | { response: NextResponse }> {
  const auth = await getAuthContext(req);

  if (!auth.isAdmin) {
    return {
      response: NextResponse.json(
        { error: "Forbidden. Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  return { auth };
}
