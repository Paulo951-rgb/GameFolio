import { createAIProvider } from "@gamer-cv/services";
import { runGeneration, buildSystemPrompt, enrichForGeneration, GenerationFormatError } from "@gamer-cv/core";
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
 * Decide whether a generation error is worth a single retry. We retry only on
 * "the model output wasn't valid structured JSON" (truncation, prose reply,
 * schema mismatch) — NOT on auth/rate-limit/network errors, which a retry would
 * only double the cost of without helping.
 */
export function isRetryable(err: unknown): boolean {
  if (err instanceof GenerationFormatError) return true;
  if (err instanceof SyntaxError) return true;
  if (err instanceof Error && /json|object found/i.test(err.message)) return true;
  return false;
}

/**
 * Shared generation logic for /api/generate and /api/regenerate. The server
 * re-normalizes the profile (defense-in-depth: even if the client claims it
 * filtered visibility, the server enforces it before the provider sees data),
 * then CONTEXT-ENRICHES it (attaches each game's metadata so the model can
 * interpret values per game, §20) and runs the anti-hallucination pipeline.
 *
 * A single retry is attempted when the model returns malformed/truncated JSON
 * (a transient failure mode for large structured outputs) — re-running the
 * pipeline gives a second chance without masking real config/auth errors.
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

  const input = {
    systemPrompt: buildSystemPrompt(mode, personality),
    profileData: enriched,
    instruction,
    mode,
    personality,
  };

  try {
    const { text, flaggedFacts } = await runGeneration(
      provider,
      input,
      gameMetaBlob,
    );
    return { text, flaggedFacts, providerId };
  } catch (err) {
    if (isRetryable(err)) {
      const { text, flaggedFacts } = await runGeneration(
        provider,
        input,
        gameMetaBlob,
      );
      return { text, flaggedFacts, providerId };
    }
    throw err;
  }
}
