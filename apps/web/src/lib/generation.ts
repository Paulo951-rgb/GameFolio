import { createAIProvider } from "@gamer-cv/services";
import { runGeneration, buildSystemPrompt, enrichForGeneration } from "@gamer-cv/core";
import { gameRegistry, moduleRegistry } from "@gamer-cv/data";
import { normalizeProfile } from "@/lib/normalize";
import type {
  GamerProfile,
  GenerationMode,
  GenerationPersonality,
} from "@gamer-cv/types";

export interface GenerationResponse {
  text: import("@gamer-cv/types").GeneratedText;
  flaggedFacts: string[];
  providerId: string;
}

/**
 * Shared generation logic for /api/generate and /api/regenerate. The server
 * re-normalizes the profile (defense-in-depth: even if the client claims it
 * filtered visibility, the server enforces it before the provider sees data),
 * then CONTEXT-ENRICHES it (attaches each game's metadata so the model can
 * interpret values per game, §20) and runs the anti-hallucination pipeline.
 */
export async function generateFromProfile(
  profile: GamerProfile,
  instruction?: string,
  mode?: GenerationMode,
  personality?: GenerationPersonality,
): Promise<GenerationResponse> {
  const { providerId, provider } = createAIProvider();
  const normalized = normalizeProfile(profile);

  const { enriched, gameMetaBlob } = enrichForGeneration(
    normalized as unknown as Record<string, unknown>,
    gameRegistry,
    moduleRegistry,
  );

  const { text, flaggedFacts } = await runGeneration(
    provider,
    {
      systemPrompt: buildSystemPrompt(mode, personality),
      profileData: enriched,
      instruction,
      mode,
      personality,
    },
    gameMetaBlob,
  );

  return { text, flaggedFacts, providerId };
}
