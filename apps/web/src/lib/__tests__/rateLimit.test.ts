import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Buckets are module-level; exhaust a fresh key each test to avoid cross-
    // test interference from the sliding window.
  });

  it("allows up to capacity requests then denies", () => {
    const key = `test-allow-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, { capacity: 5, refillRate: 0 }).ok).toBe(true);
    }
    const denied = rateLimit(key, { capacity: 5, refillRate: 0 });
    expect(denied.ok).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it("reports a positive retry-after when limited", () => {
    const key = `test-retry-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(key, { capacity: 5, refillRate: 0.1 });
    const denied = rateLimit(key, { capacity: 5, refillRate: 0.1 });
    expect(denied.ok).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it("isolates keys", () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(a, { capacity: 5, refillRate: 0 });
    expect(rateLimit(b, { capacity: 5, refillRate: 0 }).ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("parses x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(getClientIp(h)).toBe("9.9.9.9");
  });

  it("defaults to unknown", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
