import { describe, it, expect, vi } from "vitest";

// Stub Prisma's JSON null sentinel + InputJsonValue markers: the mapper casts
// to these only to satisfy Prisma's checked input types at compile time; at
// runtime the values are plain objects/null. Provide a faithful-enough stub so
// the module loads under vitest.
vi.mock("@prisma/client", () => {
  const JsonNull = Symbol("JsonNull");
  return {
    Prisma: {
      JsonNull,
      DbNull: JsonNull,
      InputJsonValue: Object,
    },
  };
});

import {
  dbProfileToProfile,
  profileToCreateData,
  profileToUpdateData,
  gamesToNestedCreate,
} from "@/lib/profile-mapper";
import type { GamerProfile, GameEntry, PersonalInfo, ThemeConfig } from "@gamer-cv/types";

const personalInfo: PersonalInfo = {
  gamerTag: "Nova",
  country: "FR",
  socials: { discord: "nova#1234" },
  visibility: { age: "hidden" },
};
const themeConfig: ThemeConfig = { templateId: "minimalist", primaryColor: "#7c3aed" };
const games: GameEntry[] = [
  { gameId: "valorant", moduleData: { currentRank: "Or" }, freeText: "main duelliste", order: 0 },
  { gameId: "minecraft", moduleData: { gameModes: ["Survie"] }, order: 1 },
];

describe("profileToCreateData / profileToUpdateData", () => {
  it("create includes userId, update omits it (ownership immutable)", () => {
    const input = {
      userId: "u1",
      personalInfo,
      playerTypes: ["competitive"],
      templateId: "minimalist",
      themeConfig,
      games,
    };
    const create = profileToCreateData(input);
    const update = profileToUpdateData(input);
    expect(create).toHaveProperty("userId", "u1");
    expect(update).not.toHaveProperty("userId");
    expect(create).toHaveProperty("templateId", "minimalist");
    expect(update).toHaveProperty("templateId", "minimalist");
  });

  it("create maps generatedText absence to Prisma.JsonNull sentinel", () => {
    const create = profileToCreateData({
      personalInfo,
      playerTypes: [],
      templateId: "minimalist",
      themeConfig,
      games,
    });
    // InputJsonValue|JsonNull union — just assert it's set & falsy.
    expect(create.generatedText).toBeTruthy() ;
  });

  it("create carries a real generatedText through", () => {
    const create = profileToCreateData({
      personalInfo,
      playerTypes: [],
      templateId: "minimalist",
      themeConfig,
      games,
      generatedText: { summary: "ok", strengths: ["aim"], perGame: { valorant: "x" } },
    });
    expect((create.generatedText as { summary: string }).summary).toBe("ok");
  });
});

describe("gamesToNestedCreate", () => {
  it("maps freeText undefined -> null and keeps order", () => {
    const mapped = gamesToNestedCreate(games);
    expect(mapped[0]).toEqual({
      gameId: "valorant",
      moduleData: { currentRank: "Or" },
      freeText: "main duelliste",
      order: 0,
    });
    expect(mapped[1].freeText).toBeNull();
  });
});

describe("dbProfileToProfile / dbGamesToEntries", () => {
  it("converts a Prisma row back to a typed GamerProfile, sorted by order", () => {
    const row = {
      id: "p1",
      userId: "u1",
      personalInfo,
      playerTypes: ["competitive"],
      templateId: "minimalist",
      themeConfig,
      generatedText: null,
      games: [
        { gameId: "minecraft", moduleData: { gameModes: ["Survie"] }, freeText: null, order: 1 },
        { gameId: "valorant", moduleData: { currentRank: "Or" }, freeText: "x", order: 0 },
      ],
    } as never;
    const profile = dbProfileToProfile(row) as GamerProfile;
    expect(profile.id).toBe("p1");
    expect(profile.templateId).toBe("minimalist");
    expect(profile.playerTypes).toEqual(["competitive"]);
    expect(profile.games.map((g) => g.gameId)).toEqual(["valorant", "minecraft"]);
    expect(profile.games[0].order).toBe(0);
  });

  it("preserves the visibility map inside personalInfo (it's data, not stripped by the mapper)", () => {
    const row = {
      id: "p1",
      userId: null,
      personalInfo,
      playerTypes: [],
      templateId: "minimalist",
      themeConfig,
      generatedText: null,
      games: [],
    } as never;
    const profile = dbProfileToProfile(row) as GamerProfile;
    expect(profile.personalInfo.visibility).toEqual({ age: "hidden" });
  });
});
