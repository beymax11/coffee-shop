import crypto from "crypto";

function getJwtSecret(): string {
  const secret =
    process.env.ADMIN_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    console.error(
      "[Admin Auth] CRITICAL: Neither ADMIN_JWT_SECRET nor SUPABASE_SERVICE_ROLE_KEY is configured in production."
    );
  }
  return "antonioni-grounds-secure-admin-token-secret-2026";
}

export const ACCESS_TOKEN_LIFESPAN_MS = 15 * 60 * 1000; // 15 Minutes
export const REFRESH_TOKEN_LIFESPAN_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: "admin" | "barista";
  sessionId: string;
  type: "access" | "refresh";
  exp: number; // Unix timestamp in milliseconds
  iat: number; // Unix timestamp in milliseconds
}

/**
 * Encodes base64url string.
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Decodes base64url string.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Signs payload to create a secure JWT using HMAC-SHA256.
 */
export function signToken(payload: AdminTokenPayload): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

/**
 * Verifies JWT signature and expiry.
 */
export function verifyToken(token: string): {
  valid: boolean;
  payload?: AdminTokenPayload;
  error?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format." };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac("sha256", getJwtSecret())
      .update(data)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return { valid: false, error: "Invalid signature." };
    }

    const payload: AdminTokenPayload = JSON.parse(
      base64UrlDecode(encodedPayload)
    );

    if (Date.now() > payload.exp) {
      return { valid: false, error: "Token has expired." };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: `Token verification failed: ${String(err)}` };
  }
}

/**
 * In-memory active session store (keyed by admin user email/ID).
 * Maps: userEmail -> { activeSessionId, lastUpdated, userAgent, clientIp }
 */
interface ActiveSessionRecord {
  activeSessionId: string;
  lastUpdated: number;
  userAgent?: string;
  clientIp?: string;
}

// Global reference across serverless invocations in the same process
const globalSessionStore = globalThis as unknown as {
  _adminActiveSessions?: Map<string, ActiveSessionRecord>;
};

if (!globalSessionStore._adminActiveSessions) {
  globalSessionStore._adminActiveSessions = new Map<string, ActiveSessionRecord>();
}

const activeSessions = globalSessionStore._adminActiveSessions;

export function registerActiveSession(
  email: string,
  sessionId: string,
  metadata?: { userAgent?: string; clientIp?: string }
): void {
  activeSessions.set(email.toLowerCase().trim(), {
    activeSessionId: sessionId,
    lastUpdated: Date.now(),
    userAgent: metadata?.userAgent,
    clientIp: metadata?.clientIp,
  });
}

export function getActiveSessionId(email: string): string | null {
  const record = activeSessions.get(email.toLowerCase().trim());
  return record ? record.activeSessionId : null;
}

export function isSessionActive(email: string, sessionId: string): boolean {
  const record = activeSessions.get(email.toLowerCase().trim());
  // If no record exists yet, allow session or initialize
  if (!record) return true;
  return record.activeSessionId === sessionId;
}

export function revokeActiveSession(email: string): void {
  activeSessions.delete(email.toLowerCase().trim());
}

/**
 * Generates both the 15-minute access token and the 7-day refresh token.
 */
export function generateAdminTokens(params: {
  userId: string;
  email: string;
  role: "admin" | "barista";
  sessionId: string;
}): {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  sessionId: string;
} {
  const now = Date.now();
  const accessExpiresAt = now + ACCESS_TOKEN_LIFESPAN_MS; // 15 mins
  const refreshExpiresAt = now + REFRESH_TOKEN_LIFESPAN_MS; // 7 days

  const accessToken = signToken({
    userId: params.userId,
    email: params.email,
    role: params.role,
    sessionId: params.sessionId,
    type: "access",
    exp: accessExpiresAt,
    iat: now,
  });

  const refreshToken = signToken({
    userId: params.userId,
    email: params.email,
    role: params.role,
    sessionId: params.sessionId,
    type: "refresh",
    exp: refreshExpiresAt,
    iat: now,
  });

  return {
    accessToken,
    refreshToken,
    accessExpiresAt,
    refreshExpiresAt,
    sessionId: params.sessionId,
  };
}
