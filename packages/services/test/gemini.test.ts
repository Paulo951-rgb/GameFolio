import { describe, it, expect } from "vitest";
import { GeminiProvider } from "../src/ai/gemini";
import { runGeneration, SYSTEM_PROMPT } from "@gamer-cv/core";
import type { GenerationInput } from "@gamer-cv/types";

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

/** A fetch stub that returns a canned Gemini-shaped response. */
function fakeFetch(text: string): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: { parts: [{ text }] },
            finishReason: "STOP",
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
}

describe("GeminiProvider", () => {
  it("sends the system instruction + user prompt and extracts structured JSON", async () => {
    const canned = JSON.stringify({
      profileSummary: "présentation de ShadowHunter.",
      gamingIdentity: "joueur compétitif",
      strengths: ["maîtrise mécanique"],
      experience: "expérience cumulée d'environ 350 heures",
      specializations: ["Duelliste"],
      performance: "Diamant",
      games: [
        {
          gameId: "valorant",
          title: "Valorant",
          description: "350 heures, rang Diamant, Duelliste.",
          highlights: ["Diamant", "Duelliste"],
        },
      ],
      summary: "présentation de ShadowHunter.",
      perGame: { valorant: "350 heures, rang Diamant." },
    });

    const calls: Array<{ url: string; body: unknown }> = [];
    const fetchImpl = (async (url: URL | string, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body });
      return fakeFetch(canned)();
    }) as typeof fetch;

    const provider = new GeminiProvider({
      apiKey: "test-key",
      model: "gemini-2.0-flash",
      fetchImpl,
    });

    const input: GenerationInput = {
      systemPrompt: SYSTEM_PROMPT,
      profileData: profileData as unknown as Record<string, unknown>,
    };
    const { text } = await runGeneration(provider, input);

    // The provider was called exactly once, against the Gemini REST endpoint.
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("generativelanguage.googleapis.com");
    expect(calls[0].url).toContain("gemini-2.0-flash");
    expect(calls[0].url).toContain("key=test-key");

    // The request body carries systemInstruction + JSON responseMimeType.
    const body = JSON.parse(String(calls[0].body));
    expect(body.systemInstruction).toBeDefined();
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.contents[0].role).toBe("user");

    // The structured output flowed through the full anti-hallucination pipeline.
    expect(text.profileSummary).toContain("ShadowHunter");
    expect(text.games[0].gameId).toBe("valorant");
  });

  it("requires an API key", () => {
    expect(() => new GeminiProvider({ apiKey: "" })).toThrow(/apiKey/i);
  });

  it("throws a clear error on a non-200 response", async () => {
    const fetchImpl = (async () =>
      new Response('{"error":{"message":"API key invalid"}}', {
        status: 400,
        statusText: "Bad Request",
      })) as typeof fetch;

    const provider = new GeminiProvider({
      apiKey: "bad-key",
      fetchImpl,
    });

    await expect(
      provider.generate({
        systemPrompt: SYSTEM_PROMPT,
        profileData: profileData as unknown as Record<string, unknown>,
      }),
    ).rejects.toThrow(/400.*API key invalid|API error 400/i);
  });

  it("throws a clear error when Gemini blocks the content", async () => {
    const fetchImpl = (async () =>
      new Response(
        JSON.stringify({
          candidates: [],
          promptFeedback: { blockReason: "SAFETY" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;

    const provider = new GeminiProvider({
      apiKey: "test-key",
      fetchImpl,
    });

    await expect(
      provider.generate({
        systemPrompt: SYSTEM_PROMPT,
        profileData: profileData as unknown as Record<string, unknown>,
      }),
    ).rejects.toThrow(/blocked.*SAFETY|empty response/i);
  });

  it("still parses when Gemini wraps the JSON in a code fence", async () => {
    const fenced = "```json\n" + JSON.stringify({
      profileSummary: "ok",
      strengths: [],
      specializations: [],
      games: [],
      perGame: {},
    }) + "\n```";

    const provider = new GeminiProvider({
      apiKey: "test-key",
      fetchImpl: fakeFetch(fenced),
    });

    const { text } = await runGeneration(provider, {
      systemPrompt: SYSTEM_PROMPT,
      profileData: profileData as unknown as Record<string, unknown>,
    });

    expect(text.profileSummary).toBe("ok");
  });
});
