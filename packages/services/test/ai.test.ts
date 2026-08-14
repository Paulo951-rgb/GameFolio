import { describe, it, expect } from "vitest";
import { MockProvider } from "../src/ai/mock";
import {
  runGeneration,
  SYSTEM_PROMPT,
} from "@gamer-cv/core";
import type { AIProvider, GenerationInput } from "@gamer-cv/types";

const profileData = {
  gamerTag: "ShadowHunter",
  playerTypes: ["competiteur"],
  games: [
    {
      gameId: "valorant",
      moduleData: { currentRank: "Diamant", hours: 350, roles: ["Duelliste"] },
      freeText: "Capitaine d'équipe",
    },
  ],
};

describe("MockProvider", () => {
  it("echoes facts present in the input without inventing any", async () => {
    const provider = new MockProvider();
    const { text, flaggedFacts } = await runGeneration(provider, {
      systemPrompt: SYSTEM_PROMPT,
      profileData: profileData as unknown as Record<string, unknown>,
    });

    expect(text.summary).toContain("ShadowHunter");
    expect(text.strengths.some((s) => s.includes("competiteur"))).toBe(true);
    expect(text.perGame.valorant).toContain("Diamant");
    expect(text.perGame.valorant).toContain("350");
    expect(text.perGame.valorant).toContain("Duelliste");
    // A fact NOT in the input must never appear.
    expect(text.perGame.valorant).not.toContain("Radiant");
    // The mock only echoes input data, so nothing should be flagged.
    expect(flaggedFacts).toEqual([]);
  });

  it("applies the regeneration instruction deterministically", async () => {
    const provider = new MockProvider();
    const input: GenerationInput = {
      systemPrompt: SYSTEM_PROMPT,
      profileData: profileData as unknown as Record<string, unknown>,
      instruction: "plus court",
    };
    const { text } = await runGeneration(provider, input);
    expect(text.summary).toContain("plus court");
  });
});

describe("runGeneration anti-hallucination guardrails", () => {
  it("flags numbers/proper nouns absent from the input data", async () => {
    // A provider that returns an invented number and rank → verifyFacts must
    // catch both as "à vérifier".
    const inventing: AIProvider = {
      async generate() {
        return {
          structured: {
            summary: "Joueur avec 9999 heures et rang Radiant.",
            strengths: [],
            perGame: {},
          },
          raw: "",
        };
      },
    };
    const { flaggedFacts } = await runGeneration(inventing, {
      systemPrompt: SYSTEM_PROMPT,
      profileData: profileData as unknown as Record<string, unknown>,
    });
    expect(flaggedFacts).toContain("9999");
    expect(flaggedFacts).toContain("Radiant");
  });
});
