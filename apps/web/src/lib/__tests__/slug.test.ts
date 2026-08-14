import { describe, it, expect, vi, beforeEach } from "vitest";

// generateUniqueSlug only needs prisma.gamerProfile.findUnique; mock it so the
// function is exercised without a real DB. vi.hoisted ensures the mock fn is
// available to the hoisted vi.mock factory.
const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: { gamerProfile: { findUnique } },
}));

import { generateUniqueSlug } from "@/lib/slug";

const AMBIGUOUS = /[0O1lI]/;
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

beforeEach(() => {
  findUnique.mockReset();
});

describe("generateUniqueSlug", () => {
  it("returns a 10-char slug with no ambiguous characters when there's no collision", async () => {
    findUnique.mockResolvedValueOnce(null);
    const slug = await generateUniqueSlug();
    expect(slug).toHaveLength(10);
    expect(AMBIGUOUS.test(slug)).toBe(false);
    for (const ch of slug) {
      expect(ALPHABET).toContain(ch);
    }
  });

  it("re-rolls on a collision until it finds a free slug", async () => {
    findUnique
      .mockResolvedValueOnce({ id: "clash" }) // first attempt collides
      .mockResolvedValueOnce({ id: "clash" }) // second too
      .mockResolvedValueOnce(null); // third is free
    const slug = await generateUniqueSlug();
    expect(slug).toHaveLength(10);
    expect(findUnique).toHaveBeenCalledTimes(3);
  });

  it("eventually falls back to a longer base64url slug after several collisions", async () => {
    findUnique.mockResolvedValue({ id: "clash" }); // always collides
    const slug = await generateUniqueSlug();
    // Exhausts 8 attempts then returns the fallback (base64url, up to 14 chars).
    expect(findUnique.mock.calls.length).toBeGreaterThanOrEqual(8);
    expect(slug.length).toBeLessThanOrEqual(14);
  });
});
