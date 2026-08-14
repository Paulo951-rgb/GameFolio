import { createAIProvider } from "@gamer-cv/services";
import { runGeneration, SYSTEM_PROMPT } from "@gamer-cv/core";
import { normalizeProfile } from "@/lib/normalize";
import type { GamerProfile } from "@gamer-cv/types";

export interface GenerationResponse {
  text: import("@gamer-cv/types").GeneratedText;
  flaggedFacts: string[];
  providerId: string;
}

/**
 * Shared generation logic for /api/generate and /api/regenerate. The server
 * re-normalizes the profile (defense-in-depth: even if the client claims it
 * filtered visibility, the server enforces it before the provider sees data).
 */
export async function generateFromProfile(
  profile: GamerProfile,
  instruction?: string,
): Promise<GenerationResponse> {
  const { providerId, provider } = createAIProvider();
  const normalized = normalizeProfile(profile);

  const { text, flaggedFacts } = await runGeneration(provider, {
    systemPrompt: SYSTEM_PROMPT,
    profileData: normalized as unknown as Record<string, unknown>,
    instruction,
  });

  return { text, flaggedFacts, providerId };
}
