import { describe, it, expect } from "vitest";
import {
  normalizeGeneratedText,
  normalizeProfile,
} from "@/lib/normalize";
import type { GamerProfile, GeneratedText } from "@gamer-cv/types";

/**
 * Regression tests for the /create crash:
 *   TypeError: Cannot read properties of undefined (reading 'length')
 *   at AIGeneratePanel.tsx — generated.specializations.length
 *
 * Root cause: GeneratedTextSchema declares specializations/strengths/games with
 * .default([]) and perGame with .default({}), but Zod only applies those defaults
 * when the data passes through .parse(). Profiles restored from IndexedDB or
 * loaded from a Prisma JSON column can carry a stale/partial generatedText whose
 * array fields are undefined at runtime despite the TS type. These tests pin the
 * contract that every array/object field is ALWAYS a real array/object (never
 * undefined) after normalization — the property the UI relies on to call
 * .length / .map without guarding.
 */

function baseProfile(generatedText?: GeneratedText): GamerProfile {
  return {
    id: "p1",
    personalInfo: { gamerTag: "ShadowHunter", visibility: {} },
    playerTypes: [],
    games: [],
    achievements: [],
    templateId: "minimalist",
    themeConfig: { templateId: "minimalist" },
    generatedText,
  } as GamerProfile;
}

describe("normalizeGeneratedText", () => {
  it("returns undefined for null/undefined (generatedText is optional)", () => {
    expect(normalizeGeneratedText(undefined)).toBeUndefined();
    expect(normalizeGeneratedText(null)).toBeUndefined();
  });

  it("passes a fully valid V2 object through with arrays intact", () => {
    const valid = {
      profileSummary: "Player presentation",
      gamingIdentity: "competitive player",
      strengths: ["mechanical skill"],
      experience: "lots of hours",
      specializations: ["Duelist", "IGL"],
      performance: "Diamond 2",
      games: [
        { gameId: "valorant", description: "800h", highlights: ["Diamond 2"] },
      ],
      summary: "legacy summary",
      perGame: { valorant: "800h" },
    };
    const out = normalizeGeneratedText(valid);
    expect(out).toBeDefined();
    expect(out!.specializations).toEqual(["Duelist", "IGL"]);
    expect(out!.strengths).toEqual(["mechanical skill"]);
    expect(out!.games).toHaveLength(1);
    expect(out!.games[0].highlights).toEqual(["Diamond 2"]);
    expect(out!.perGame).toEqual({ valorant: "800h" });
  });

  it("CRASH FIX: specializations undefined becomes [] (not undefined)", () => {
    // Exactly the shape that crashed /create: an object that passed `generated &&`
    // but whose specializations/strengths/games/perGame were never set.
    const stale = {
      profileSummary: "présentation de ShadowHunter.",
      // specializations, strengths, games, perGame all MISSING
    } as unknown as GeneratedText;
    const out = normalizeGeneratedText(stale);
    expect(out).toBeDefined();
    expect(Array.isArray(out!.specializations)).toBe(true);
    expect(out!.specializations).toEqual([]);
    expect(out!.specializations.length).toBe(0); // the exact expression that threw
  });

  it("guarantees ALL array/object fields are non-undefined on a partial shape", () => {
    const partial = { experience: "some experience" } as unknown as GeneratedText;
    const out = normalizeGeneratedText(partial);
    expect(out).toBeDefined();
    // Every field the UI touches with .length / .map / Object.keys must be defined.
    expect(Array.isArray(out!.strengths)).toBe(true);
    expect(Array.isArray(out!.specializations)).toBe(true);
    expect(Array.isArray(out!.games)).toBe(true);
    expect(out!.perGame).toEqual({});
    expect(out!.games[0]?.highlights).toBeUndefined(); // empty games array
  });

  it("keeps salvageable legacy content (summary / perGame) from an old shape", () => {
    const legacy = {
      summary: "old school CV text",
      perGame: { minecraft: "2000h redstone" },
    } as unknown as GeneratedText;
    const out = normalizeGeneratedText(legacy);
    expect(out).toBeDefined();
    expect(out!.summary).toBe("old school CV text");
    expect(out!.perGame).toEqual({ minecraft: "2000h redstone" });
    expect(out!.specializations).toEqual([]);
    expect(out!.games).toEqual([]);
  });

  it("drops a foreign blob with no recognizable CV content", () => {
    const foreign = { nope: true, random: 42 } as unknown as GeneratedText;
    expect(normalizeGeneratedText(foreign)).toBeUndefined();
  });

  it("sanitizes a malformed games array (non-objects / missing gameId)", () => {
    const messy = {
      profileSummary: "ok",
      games: [
        "not-an-object",
        { gameId: "valorant", description: "800h", highlights: "not-an-array" },
        { description: "no game id" }, // dropped: no gameId AND no description? has description -> kept
        null,
      ],
    } as unknown as GeneratedText;
    const out = normalizeGeneratedText(messy);
    expect(out).toBeDefined();
    // Only the valid object survives; its highlights becomes [].
    expect(out!.games).toHaveLength(2);
    expect(out!.games[0].gameId).toBe("valorant");
    expect(out!.games[0].highlights).toEqual([]);
  });

  it("treats an incomplete AI response safely (only profileSummary present)", () => {
    const incomplete = { profileSummary: "Short intro" } as unknown as GeneratedText;
    const out = normalizeGeneratedText(incomplete);
    expect(out).toBeDefined();
    expect(out!.profileSummary).toBe("Short intro");
    // The UI section guards on .length for these — must not throw.
    expect(() => out!.specializations.length).not.toThrow();
    expect(() => out!.strengths.length).not.toThrow();
    expect(() => out!.games.length).not.toThrow();
    expect(() => Object.keys(out!.perGame)).not.toThrow();
  });
});

describe("normalizeProfile (generatedText protection)", () => {
  it("normalizes a stale generatedText coming from persistence/Prisma", () => {
    const profile = baseProfile({
      profileSummary: "hi",
      // specializations/games/perGame undefined at runtime
    } as unknown as GeneratedText);
    const data = normalizeProfile(profile);
    expect(data.generated).toBeDefined();
    expect(data.generated!.specializations).toEqual([]);
    expect(data.generated!.games).toEqual([]);
  });

  it("returns generated undefined when generatedText is absent", () => {
    const profile = baseProfile(undefined);
    expect(normalizeProfile(profile).generated).toBeUndefined();
  });
});
