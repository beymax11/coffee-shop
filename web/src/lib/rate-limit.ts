import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window cache
const ipRateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRateLimitStore.entries()) {
      if (now > record.resetTime) {
        ipRateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
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
 * Applies an in-memory rate limit for a specific key/prefix.
 * @param key Unique key (e.g. `signup:${ip}`)
 * @param maxRequests Maximum requests allowed within window
 * @param windowSeconds Window length in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = ipRateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    const record: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    ipRateLimitStore.set(key, record);
    return {
      success: true,
      remaining: maxRequests - 1,
      reset: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    const secondsRemaining = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      success: false,
      remaining: 0,
      reset: secondsRemaining,
    };
  }

  existing.count += 1;
  const secondsRemaining = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
  return {
    success: true,
    remaining: maxRequests - existing.count,
    reset: secondsRemaining,
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
        retryAfter: result.reset,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.reset),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  return null;
}
