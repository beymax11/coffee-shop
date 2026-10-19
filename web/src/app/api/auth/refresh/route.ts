import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  signToken,
  isSessionActive,
  ACCESS_TOKEN_LIFESPAN_MS,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    let refreshToken = req.cookies.get("admin_refresh_token")?.value;

    if (!refreshToken) {
      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch {
        // Body was not json or empty
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token provided." },
        { status: 401 }
      );
    }

    // 1. Verify token cryptographic signature and expiry
    const verification = verifyToken(refreshToken);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        {
          error:
            verification.error ||
            "Your 7-day session has expired. Please sign in again.",
          expired: true,
        },
        { status: 401 }
      );
    }

    const payload = verification.payload;

    if (payload.type !== "refresh") {
      return NextResponse.json(
        { error: "Invalid token type for refresh." },
        { status: 400 }
      );
    }

    // 2. Single Active Session Check: Has this session been superseded by a newer login?
    const active = isSessionActive(payload.email, payload.sessionId);
    if (!active) {
      const res = NextResponse.json(
        {
          error:
            "Your session was terminated because this account logged in on another device.",
          kickedOut: true,
        },
        { status: 401 }
      );
      // Clear all admin cookies
      res.headers.append("Set-Cookie", "admin_access_token=; Path=/; Max-Age=0");
      res.headers.append("Set-Cookie", "admin_refresh_token=; Path=/; Max-Age=0");
      res.headers.append("Set-Cookie", "admin_session_id=; Path=/; Max-Age=0");
      res.headers.append("Set-Cookie", "admin_session=; Path=/; Max-Age=0");
      return res;
    }

    // 3. Issue a fresh 15-minute access token preserving sessionId and user details
    const now = Date.now();
    const accessExpiresAt = now + ACCESS_TOKEN_LIFESPAN_MS;

    const newAccessToken = signToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      type: "access",
      exp: accessExpiresAt,
      iat: now,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const secureFlag = isProduction ? "; Secure" : "";

    const res = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      accessExpiresAt,
      refreshExpiresAt: payload.exp, // The hard 7-day limit from original login
    });

    // Update the 15-minute access token cookie
    res.headers.append(
      "Set-Cookie",
      `admin_access_token=${newAccessToken}; Path=/; Max-Age=900; SameSite=Lax${secureFlag}`
    );

    return res;
  } catch (err) {
    console.error("POST /api/auth/refresh error:", err);
    return NextResponse.json(
      { error: "Failed to refresh access token." },
      { status: 500 }
    );
  }
}
