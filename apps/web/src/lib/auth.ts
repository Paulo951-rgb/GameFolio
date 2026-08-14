import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Self-contained auth — no external auth library. Uses Node crypto.scrypt for
 * password hashing (memory-hard, salted) and an HMAC-signed session token in an
 * httpOnly cookie. This keeps the auth layer self-contained and testable
 * without an email-sender or OAuth provider, while remaining "optional"
 * (architecture §10): local-first profiles work without an account; cloud
 * save + public share require one.
 *
 * Token format: `<userId>.<hmac>` where hmac = HMAC-SHA256(secret, userId).
 * The userId is public-ish (it's in the token); the HMAC proves the token was
 * minted by this server with the current secret. Stateless verification — no
 * session table needed for the MVP.
 */

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE = "gc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET must be set to a random string of at least 16 chars.",
    );
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function sign(userId: string): string {
  const mac = createHmac("sha256", getSecret()).update(userId).digest("hex");
  return `${userId}.${mac}`;
}

function verify(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const userId = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(userId).digest("hex");
  if (mac.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? userId : null;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = sign(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

/**
 * Resolve the session userId for a request, or throw a 401-shaped error. Use
 * on routes that REQUIRE a logged-in user.
 */
export async function requireUser(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    const err = new Error("UNAUTHORIZED");
    (err as { status?: number }).status = 401;
    throw err;
  }
  return userId;
}
