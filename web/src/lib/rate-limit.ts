import { NextRequest } from "next/server";

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
  resetSeconds: number;
}

/**
 * Checks and records a rate limit hit for a given identifier (e.g. IP address).
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 10 * 60 * 1000, max: 5 }
): RateLimitResult {
  cleanupExpired(options.windowMs);

  const now = Date.now();
  const threshold = now - options.windowMs;

  const record = ipRequestMap.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside the active window
  const activeTimestamps = record.timestamps.filter((ts) => ts > threshold);

  if (activeTimestamps.length >= options.max) {
    const oldestTimestamp = activeTimestamps[0];
    const resetMs = oldestTimestamp + options.windowMs - now;
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil(resetMs / 1000)),
    };
  }

  activeTimestamps.push(now);
  ipRequestMap.set(identifier, { timestamps: activeTimestamps });

  const oldestTimestamp = activeTimestamps[0];
  const resetMs = oldestTimestamp + options.windowMs - now;

  return {
    success: true,
    limit: options.max,
    remaining: options.max - activeTimestamps.length,
    resetSeconds: Math.max(1, Math.ceil(resetMs / 1000)),
  };
}

/**
 * Extracts the best client IP candidate from NextRequest headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list of IPs (client, proxy1, proxy2)
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}
