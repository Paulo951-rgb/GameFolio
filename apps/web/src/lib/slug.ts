import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no ambiguous chars (0/O, 1/l)
const SLUG_LEN = 10;

/**
 * Generate a unique share slug. Distinct from the profile id (architecture §9)
 * so it carries no information about the internal id, and regenerable without
 * deleting the profile. Collision-checked against the DB before returning.
 */
export async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const bytes = randomBytes(SLUG_LEN);
    let slug = "";
    for (let i = 0; i < SLUG_LEN; i++) {
      slug += ALPHABET[bytes[i] % ALPHABET.length];
    }
    const clash = await prisma.gamerProfile.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) return slug;
  }
  // Vanishingly unlikely; fall back to a longer random slug.
  return randomBytes(8).toString("base64url").slice(0, 14);
}
