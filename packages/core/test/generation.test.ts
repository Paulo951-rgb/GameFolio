/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { defineModule } from "../src/modules/index";
import {
  enrichForGeneration,
  buildSystemPrompt,
  MODE_GUIDANCE,
  PERSONALITY_GUIDANCE,
  verifyFacts,
  SYSTEM_PROMPT,
} from "../src/generation/index";
import type { GameDefinition, GeneratedText } from "@gamer-cv/types";

const competitiveModule = defineModule({
  id: "competitive",
  schema: z.object({
    currentRank: z.string().optional(),
    roles: z.array(z.string()).optional(),
    hours: z.number().optional(),
  }),
  fields: [
    { key: "currentRank", label: "Rang actuel", type: "select", options: ["Fer", "Bronze", "Or", "Diamant", "Radiant"] },
    { key: "roles", label: "Rôles", type: "multiselect", options: ["Duelliste", "Sentinelle"] },
    { key: "hours", label: "Heures", type: "number" },
  ],
});

const valorant: GameDefinition = {
  id: "valorant",
  name: "Valorant",
  modules: ["competitive"],
  genres: ["FPS", "Compétitif"],
  aliases: ["valo"],
  gameData: { ranks: ["Fer", "Bronze", "Or", "Diamant", "Radiant"], roles: ["Duelliste", "Sentinelle"] },
  platforms: ["PC"],
};

describe("buildSystemPrompt", () => {
  it("base prompt forbids inventing and requires analysis", () => {
    const p = buildSystemPrompt();
    expect(p.toLowerCase()).toContain("n'invente");
    expect(p.toLowerCase()).toContain("analyser");
  });

  it("appends mode + personality guidance when provided", () => {
    const p = buildSystemPrompt("competitive", "gaming");
    expect(p).toContain(MODE_GUIDANCE.competitive);
    expect(p).toContain(PERSONALITY_GUIDANCE.gaming);
  });

  it("omits guidance sections when not provided", () => {
    const p = buildSystemPrompt();
    expect(p).not.toContain("MODE ");
    expect(p).not.toContain("TON :");
  });
});

describe("enrichForGeneration", () => {
  it("attaches game context (name/genres/modules/metadata) to each entry", () => {
    const games = new Map([["valorant", valorant]]);
    const mods = new Map([["competitive", competitiveModule]]);
    const profile = {
      games: [
        { gameId: "valorant", moduleData: { currentRank: "Diamant", hours: 350 }, freeText: "Capitaine" },
      ],
    };
    const { enriched } = enrichForGeneration(profile, games, mods);
    const g = (enriched.games as Array<Record<string, unknown>>)[0];
    expect(g.__context).toMatchObject({
      name: "Valorant",
      genres: ["FPS", "Compétitif"],
      modules: ["competitive"],
    });
    // freeText still surfaces at top level (§11 — analyzed like stats).
    expect(g.freeText).toBe("Capitaine");
  });

  it("keeps the entry intact when the game is not in the registry", () => {
    const { enriched } = enrichForGeneration(
      { games: [{ gameId: "unknown-game", moduleData: {} }] },
      new Map(),
      new Map(),
    );
    const g = (enriched.games as Array<Record<string, unknown>>)[0];
    expect(g.__context).toBeUndefined();
    expect(g.gameId).toBe("unknown-game");
  });

  it("builds a gameMetaBlob with names, genres, aliases and catalogue values", () => {
    const { gameMetaBlob } = enrichForGeneration(
      { games: [{ gameId: "valorant", moduleData: {} }] },
      new Map([["valorant", valorant]]),
      new Map([["competitive", competitiveModule]]),
    );
    const blob = gameMetaBlob.toLowerCase();
    expect(blob).toContain("valorant");
    expect(blob).toContain("valo"); // alias
    expect(blob).toContain("radiant"); // catalogue rank
    expect(blob).toContain("duelliste"); // catalogue role
  });
});

describe("verifyFacts with game meta blob", () => {
  const input = { hours: 350, currentRank: "Diamant" };
  // A blob legitimately exposing the game's ranks/roles to the model.
  const metaBlob = "valorant radiant duelliste sentinelle fer bronze or diamant";

  it("does NOT flag entities present in the game meta blob", () => {
    const gen: GeneratedText = {
      profileSummary: "Joueur Diamant, connaît le rang Radiant.",
      strengths: [],
      specializations: [],
      games: [],
      perGame: {},
    };
    const flagged = verifyFacts(gen, input, metaBlob);
    // "Diamant" is in input AND meta; "Radiant" is in meta → neither flagged.
    expect(flagged).not.toContain("Radiant");
    expect(flagged).not.toContain("Diamant");
  });

  it("flags an invented rank absent from both input and meta", () => {
    const gen: GeneratedText = {
      profileSummary: "Atteint le rang Immortel.",
      strengths: [],
      specializations: [],
      games: [],
      perGame: {},
    };
    const flagged = verifyFacts(gen, input, metaBlob);
    expect(flagged).toContain("Immortel");
  });

  it("ignores common French words even when capitalized at sentence start", () => {
    const gen: GeneratedText = {
      profileSummary: "Le profil du joueur est solide.",
      strengths: [],
      specializations: [],
      games: [],
      perGame: {},
    };
    const flagged = verifyFacts(gen, input, metaBlob);
    expect(flagged).not.toContain("Le");
    expect(flagged).not.toContain("Profil");
  });
});

describe("SYSTEM_PROMPT invariants", () => {
  it("mentions analysis vs reformatting distinction", () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain("analyser");
    expect(SYSTEM_PROMPT.toLowerCase()).toContain("reformatage");
  });

  it("lists the forbidden inventions", () => {
    const lower = SYSTEM_PROMPT.toLowerCase();
    for (const word of ["statistique", "rang", "heures", "compétition", "performance", "récompense"]) {
      expect(lower).toContain(word);
    }
  });
});
