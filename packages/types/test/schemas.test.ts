import { describe, it, expect } from "vitest";
import {
  GamerProfileSchema,
  PersonalInfoSchema,
  GameEntrySchema,
  ThemeConfigSchema,
  GeneratedTextSchema,
} from "../src";

describe("Profile schemas", () => {
  it("accepts a minimal valid profile", () => {
    const profile = {
      id: "abc",
      personalInfo: { gamerTag: "Player1", visibility: {} },
      playerTypes: [],
      games: [],
      templateId: "minimalist",
      themeConfig: { templateId: "minimalist" },
    };
    expect(GamerProfileSchema.safeParse(profile).success).toBe(true);
  });

  it("rejects profile without gamerTag", () => {
    const r = PersonalInfoSchema.safeParse({ visibility: {} });
    expect(r.success).toBe(false);
  });

  it("rejects negative age", () => {
    const r = PersonalInfoSchema.safeParse({
      gamerTag: "x",
      age: -5,
      visibility: {},
    });
    expect(r.success).toBe(false);
  });

  it("accepts moduleData as arbitrary record", () => {
    const r = GameEntrySchema.safeParse({
      gameId: "valorant",
      moduleData: { currentRank: "Diamant", roles: ["Duelliste"] },
      order: 0,
    });
    expect(r.success).toBe(true);
  });

  it("validates themeConfig enum + bounds", () => {
    expect(
      ThemeConfigSchema.safeParse({ templateId: "t", density: "normal" })
        .success,
    ).toBe(true);
    expect(
      ThemeConfigSchema.safeParse({ templateId: "t", density: "huge" })
        .success,
    ).toBe(false);
    expect(
      ThemeConfigSchema.safeParse({ templateId: "t", columns: 5 }).success,
    ).toBe(false);
  });

  it("validates GeneratedText structure", () => {
    expect(
      GeneratedTextSchema.safeParse({
        summary: "s",
        strengths: ["a"],
        perGame: { valorant: "text" },
      }).success,
    ).toBe(true);
    expect(
      GeneratedTextSchema.safeParse({ summary: "s", strengths: [], perGame: {} })
        .success,
    ).toBe(true);
  });
});
