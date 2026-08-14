import type { GeneratedText } from "./theme";
import { z } from "zod";

/**
 * Generation modes (§18) — how much detail / what to emphasize.
 *  - rapid      : short presentation
 *  - standard   : full CV
 *  - detailed   : very complete, longer descriptions
 *  - competitive: emphasize ranks / performance / competition / roles / stats
 *  - portfolio  : emphasize projects / creations / experience / versatility
 */
export const GenerationModeSchema = z.enum([
  "rapid",
  "standard",
  "detailed",
  "competitive",
  "portfolio",
]);
export type GenerationMode = z.infer<typeof GenerationModeSchema>;

/**
 * Text personality (§19) — tone & style of the generated prose.
 */
export const GenerationPersonalitySchema = z.enum([
  "professionnel",
  "gaming",
  "competitif",
  "sobre",
  "dynamique",
  "detaille",
  "court",
  "naturel",
]);
export type GenerationPersonality = z.infer<
  typeof GenerationPersonalitySchema
>;

/**
 * Provider-agnostic AI interface (section 6). The rest of the app depends only
 * on AIProvider, never on a vendor SDK. The active provider is chosen by server
 * config (env var) and is swappable without touching the domain.
 */
export interface AIProvider {
  generate(input: GenerationInput): Promise<GenerationOutput>;
}

/**
 * Input to a generation call. `profileData` is ALREADY visibility-filtered and
 * empty-stripped (never contains private/hidden fields or empty values — those
 * would invite the model to "complete" them). It is also CONTEXT-ENRICHED: each
 * game entry carries the game's name/genres/modules/metadata so the model can
 * interpret field values (e.g. "Diamant" means a different thing per game).
 */
export interface GenerationInput {
  systemPrompt: string;
  profileData: Record<string, unknown>;
  /** Free instruction for guided regeneration, e.g. "plus court". */
  instruction?: string;
  /** Generation mode (§18). */
  mode?: GenerationMode;
  /** Text personality (§19). */
  personality?: GenerationPersonality;
}

export interface GenerationOutput {
  /** Structured JSON matching GeneratedTextSchema. */
  structured: unknown;
  /** Raw model output, kept for debugging/audit. */
  raw?: string;
}

export type { GeneratedText };
