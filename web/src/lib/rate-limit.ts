import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [key, record] of ipRequestMap.entries()) {
    const valid = record.timestamps.filter((ts) => ts > threshold);
    if (valid.length === 0) {
      ipRequestMap.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}

export interface RateLimitOptions {
  windowMs: number; // Duration of window in ms
  max: number;      // Max allowed hits within window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  resetSeconds: number;
}

/**
 * Extracts client IP from request headers or socket info.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

/**
 * Checks and records a rate limit hit for a given identifier (e.g. IP address).
 * Supports both options object or (maxRequests, windowSeconds) signature.
 */
export function checkRateLimit(
  identifier: string,
  optionsOrMax?: RateLimitOptions | number,
  windowSeconds?: number
): RateLimitResult {
  let max = 5;
  let windowMs = 10 * 60 * 1000;

  if (typeof optionsOrMax === "number") {
    max = optionsOrMax;
    windowMs = (windowSeconds ?? 60) * 1000;
  } else if (optionsOrMax && typeof optionsOrMax === "object") {
    max = optionsOrMax.max;
    windowMs = optionsOrMax.windowMs;
  }

  cleanupExpired(windowMs);

  const now = Date.now();
  const threshold = now - windowMs;

  const record = ipRequestMap.get(identifier) || { timestamps: [] };
  const activeTimestamps = record.timestamps.filter((ts) => ts > threshold);

  if (activeTimestamps.length >= max) {
    const oldestTimestamp = activeTimestamps[0] || (now - windowMs);
    const resetMs = Math.max(1000, oldestTimestamp + windowMs - now);
    const secondsRemaining = Math.max(1, Math.ceil(resetMs / 1000));
    return {
      success: false,
      limit: max,
      remaining: 0,
      reset: secondsRemaining,
      resetSeconds: secondsRemaining,
    };
  }

  activeTimestamps.push(now);
  ipRequestMap.set(identifier, { timestamps: activeTimestamps });

  const oldestTimestamp = activeTimestamps[0];
  const resetMs = Math.max(1000, oldestTimestamp + windowMs - now);
  const secondsRemaining = Math.max(1, Math.ceil(resetMs / 1000));

  return {
    success: true,
    limit: max,
    remaining: Math.max(0, max - activeTimestamps.length),
    reset: secondsRemaining,
    resetSeconds: secondsRemaining,
  };
}

/**
 * Convenience helper to enforce rate limiting inside Route Handlers.
 * Returns null if allowed, or a 429 NextResponse if rate limit exceeded.
 */
export function enforceRateLimit(
  req: NextRequest,
  prefix: string,
  maxRequests: number,
  windowSeconds: number
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const result = checkRateLimit(key, maxRequests, windowSeconds);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please slow down and try again later.",
        retryAfter: result.resetSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetSeconds),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetSeconds),
        },
      }
    );
  }

  return null;
}
