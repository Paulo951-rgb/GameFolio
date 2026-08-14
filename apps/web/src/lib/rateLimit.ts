/**
 * Simple in-memory rate limiter for the MVP (architecture doc §3: "limite en
 * mémoire pour le MVP"). For production use Upstash Redis or similar.
 *
 * Sliding-window token bucket per key (IP or session id). Not distributed —
 * each server process keeps its own counters, which is acceptable for a
 * single-instance MVP and for routes that are expensive (AI generation / export).
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const DEFAULT_CAPACITY = 5; // burst size
const DEFAULT_REFILL_RATE = 0.1; // tokens per second (~3/min sustained)

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  capacity?: number;
  refillRate?: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Epoch ms when the caller may retry (0 if ok). */
  retryAfterMs: number;
}

export function rateLimit(
  key: string,
  opts: RateLimitOptions = {},
): RateLimitResult {
  const capacity = opts.capacity ?? DEFAULT_CAPACITY;
  const refillRate = opts.refillRate ?? DEFAULT_REFILL_RATE;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill based on elapsed time.
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsedSec * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { ok: true, retryAfterMs: 0 };
  }

  const needed = 1 - bucket.tokens;
  const retryAfterMs = Math.ceil((needed / refillRate) * 1000);
  return { ok: false, retryAfterMs };
}

/** Extract a best-effort client identifier (IP) from Next.js headers. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
