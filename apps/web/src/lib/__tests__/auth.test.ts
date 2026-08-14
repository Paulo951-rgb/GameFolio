import { describe, it, expect, beforeEach, vi } from "vitest";
import { hashPassword, verifyPassword, setSessionCookie, getCurrentUserId } from "@/lib/auth";

// next/headers is only used by setSessionCookie/getCurrentUserId; stub it so
// importing auth.ts in a node test doesn't pull in the Next runtime. We back it
// with a tiny in-memory cookie store so we can exercise the token round-trip.
let cookieStore: Record<string, string> = {};
const cookiesMock = {
  get: (name: string) => (cookieStore[name] ? { value: cookieStore[name] } : undefined),
  set: (name: string, value: string) => {
    cookieStore[name] = value;
  },
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookiesMock),
}));

beforeEach(() => {
  process.env.AUTH_SECRET = "test-secret-32-chars-long-aaa";
});

describe("password hashing", () => {
  it("hashes and verifies a password round-trip", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toMatch(/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("right-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password (per-salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same", a)).toBe(true);
    expect(await verifyPassword("same", b)).toBe(true);
  });

  it("rejects malformed stored strings", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "argon2$salt$hash")).toBe(false);
  });
});

describe("session tokens", () => {
  beforeEach(() => {
    cookieStore = {};
  });

  it("round-trips: a cookie set by setSessionCookie verifies via getCurrentUserId", async () => {
    await setSessionCookie("user-123");
    expect(await getCurrentUserId()).toBe("user-123");
  });

  it("returns null with no cookie", async () => {
    expect(await getCurrentUserId()).toBeNull();
  });

  it("rejects a tampered token (wrong mac)", async () => {
    await setSessionCookie("user-123");
    const [uid] = cookieStore.gc_session.split(".");
    cookieStore.gc_session = `${uid}.deadbeef`;
    expect(await getCurrentUserId()).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    await setSessionCookie("user-123");
    process.env.AUTH_SECRET = "a-completely-different-secret-32c";
    expect(await getCurrentUserId()).toBeNull();
  });

  it("throws if AUTH_SECRET is missing/too short", async () => {
    delete process.env.AUTH_SECRET;
    await expect(setSessionCookie("u")).rejects.toThrow(/AUTH_SECRET/);
  });
});
