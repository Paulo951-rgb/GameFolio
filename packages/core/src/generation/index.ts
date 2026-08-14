import type {
  AIProvider,
  GenerationInput,
  GenerationOutput,
  GeneratedText,
} from "@gamer-cv/types";
import { GeneratedTextSchema } from "@gamer-cv/types";
import { z } from "zod";

/**
 * Generation orchestration — the anti-hallucination pipeline (section 6).
 * The orchestration logic lives in core (no provider SDK coupling here);
 * it depends only on the AIProvider interface. The actual provider adapter
 * is injected from packages/services/ai at runtime.
 *
 * Pipeline:
 *  1. serializeProfile      — keep only filled fields (never send empties,
 *                              so the model has nothing to "complete").
 *  2. buildSystemPrompt     — strict role + explicit anti-invention instructions.
 *  3. generate + validate   — structured JSON output validated by GeneratedTextSchema.
 *  4. verifyFacts            — extract numbers/proper nouns from the generated text
 *                              and flag anything absent from the input data.
 *  5. (retry once if facts fail) — delegated to the caller via retry policy.
 */
export const SYSTEM_PROMPT = [
  "Tu es un rédacteur de CV pour joueurs.",
  "Tu reçois des données structurées provenant du profil d'un joueur.",
  "RÈGLE ABSOLUE : n'invente JAMAIS une statistique, un rang, un niveau, un nombre d'heures, un personnage, un rôle ou un fait qui n'est pas explicitement présent dans les données fournies.",
  "Si une information est absente ou ambiguë, ne l'évoque pas. Reformule sobrement plutôt que d'extrapoler.",
  "Réponds UNIQUEMENT au format JSON structuré demandé.",
].join(" ");

/**
 * Step 1: serialize only filled fields. Empty/undefined values are stripped
 * so the model cannot "complete" a missing rank/hours. The input is the
 * visibility-filtered profile (private/hidden fields already removed upstream).
 */
export function serializeProfile(
  profile: object,
): Record<string, unknown> {
  const cleaned = dropEmpty(JSON.parse(JSON.stringify(profile)) as unknown);
  if (cleaned && typeof cleaned === "object" && !Array.isArray(cleaned)) {
    return cleaned as Record<string, unknown>;
  }
  return {};
}

function dropEmpty(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(dropEmpty).filter((v) => !isEmpty(v));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = dropEmpty(v);
      if (!isEmpty(cleaned)) out[k] = cleaned;
    }
    return out;
  }
  return value;
}

function isEmpty(v: unknown): boolean {
  return (
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === "object" && v !== null && Object.keys(v).length === 0)
  );
}

/**
 * Step 4: fact verification. Extract tokens (numbers + capitalized words) from
 * the generated text and flag any number or proper-noun value that does not
 * appear in the serialized input data. Returns the suspicious tokens.
 */
export function verifyFacts(
  generated: GeneratedText,
  inputData: Record<string, unknown>,
): string[] {
  const inputBlob = JSON.stringify(inputData).toLowerCase();
  const text = `${generated.summary} ${generated.strengths.join(" ")} ${Object.values(generated.perGame).join(" ")}`;
  const suspicious: string[] = [];
  // Numbers (including decimals) — compare against any number substring in input.
  const numberMatches = text.match(/\b\d+(\.\d+)?\b/g) ?? [];
  for (const n of numberMatches) {
    if (!inputBlob.includes(n)) suspicious.push(n);
  }
  // Proper nouns (Capitalized sequences) — compare lowercased against input blob.
  const nounMatches = text.match(/\b[A-Z][a-zA-Z]{2,}\b/g) ?? [];
  for (const noun of nounMatches) {
    if (!inputBlob.includes(noun.toLowerCase())) suspicious.push(noun);
  }
  return [...new Set(suspicious)];
}

/**
 * Run the full pipeline against a provider. Returns the generated text plus a
 * list of facts flagged as "à vérifier". The provider must return structured
 * JSON matching GeneratedTextSchema; otherwise we throw (caller decides retry).
 */
export async function runGeneration(
  provider: AIProvider,
  input: GenerationInput,
): Promise<{ text: GeneratedText; flaggedFacts: string[] }> {
  const serialized = serializeProfile(input.profileData);
  const output: GenerationOutput = await provider.generate({
    systemPrompt: SYSTEM_PROMPT,
    profileData: serialized,
    instruction: input.instruction,
  });

  const parsed = GeneratedTextSchema.safeParse(output.structured);
  if (!parsed.success) {
    throw new GenerationFormatError(parsed.error);
  }
  const flaggedFacts = verifyFacts(parsed.data, serialized);
  return { text: parsed.data, flaggedFacts };
}

export class GenerationFormatError extends Error {
  constructor(public readonly zodError: z.ZodError) {
    super("AI output did not match the structured schema");
    this.name = "GenerationFormatError";
  }
}
