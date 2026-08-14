import type { GeneratedText } from "./theme.js";

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
 * would invite the model to "complete" them).
 */
export interface GenerationInput {
  systemPrompt: string;
  profileData: Record<string, unknown>;
  /** Free instruction for guided regeneration, e.g. "plus court". */
  instruction?: string;
}

export interface GenerationOutput {
  /** Structured JSON matching GeneratedTextSchema. */
  structured: unknown;
  /** Raw model output, kept for debugging/audit. */
  raw?: string;
}

export type { GeneratedText };
