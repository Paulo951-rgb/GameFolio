import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProvider,
  GenerationInput,
  GenerationOutput,
} from "@gamer-cv/types";

/**
 * AnthropicProvider — concrete AIProvider backed by the Anthropic Messages API.
 *
 * Server-side ONLY: the API key never reaches the client. The provider is
 * instantiated once (factory in ./index.ts) and injected wherever generation
 * is needed, so the domain never imports the SDK directly.
 *
 * Structured output: the model is instructed to reply with a JSON object
 * matching GeneratedTextSchema; we extract the JSON from the response and
 * return it as `structured` (validated upstream by runGeneration). The raw
 * text is kept for debugging.
 */
export interface AnthropicProviderOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  /** Injectable for tests (avoids real network). */
  client?: Anthropic;
}

export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(opts: AnthropicProviderOptions) {
    if (!opts.apiKey) {
      throw new Error("AnthropicProvider: apiKey is required");
    }
    this.client = opts.client ?? new Anthropic({ apiKey: opts.apiKey });
    this.model = opts.model ?? "claude-3-5-sonnet-latest";
    // 4096 leaves headroom for a detailed CV (many games, full sections) so the
    // structured JSON isn't truncated mid-object (truncation → parse failure →
    // 500). 2048 was too tight for "detailed" mode / 5+ games.
    this.maxTokens = opts.maxTokens ?? 4096;
  }

  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const userMessage = buildUserMessage(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: input.systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return { structured: extractJson(raw), raw };
  }
}

/**
 * Build the user-facing prompt from the serialized profile + optional guided
 * regeneration instruction. The data is already visibility-filtered,
 * empty-stripped AND context-enriched upstream (runGeneration): each game entry
 * carries a `__context` with the game's name/genres/modules/metadata so the
 * model can interpret field values per game (§20).
 */
export function buildUserMessage(input: GenerationInput): string {
  const data = JSON.stringify(input.profileData, null, 2);
  const lines = [
    "Voici les données du profil du joueur (JSON). Chaque jeu contient un objet `__context` décrivant le jeu (nom, genres, modules, métadonnées : rangs/rôles/personnages/modes disponibles) — utilise-le pour interpréter les valeurs (un rang ou un pourcentage n'a pas la même signification selon le jeu). Le champ `freeText` contient les informations libres saisies par le joueur : analyse-les au même niveau que les statistiques structurées.",
    "```json",
    data,
    "```",
    "",
    "Analyse ce profil, comprends les expériences du joueur, détecte ses points forts, croise les informations, puis rédige un vrai CV gamer. Réponds UNIQUEMENT avec un objet JSON de cette forme :",
    '{',
    '  "profileSummary": "présentation personnalisée du joueur",',
    '  "gamingIdentity": "type de joueur détecté à partir des données",',
    '  "strengths": ["point fort déduit des données", ...],',
    '  "experience": "résumé global de l\'expérience",',
    '  "specializations": ["rôles, mécaniques, styles de jeu", ...],',
    '  "performance": "rangs, records, progression (si pertinent)",',
    '  "games": [ { "gameId": "...", "title": "...", "description": "...", "highlights": ["..."] } ],',
    '  "summary": "résumé court (rétrocompatible)",',
    '  "perGame": { "gameId": "description courte" }',
    '}',
    "Tu PEUX déduire des TENDANCES GÉNÉRALES. Tu NE PEUX PAS inventer une statistique, un rang, un nombre d'heures, une compétition, une récompense ou une compétence précise absente des données. Ne mentionne QUE les informations présentes.",
  ];
  if (input.instruction) {
    lines.push("", `Instruction supplémentaire : ${input.instruction}`);
  }
  lines.push("", "Réponds uniquement avec l'objet JSON, sans texte autour.");
  return lines.join("\n");
}

/**
 * Extract a JSON object from a model response that may include code fences or
 * surrounding prose. Throws if no JSON object can be parsed.
 */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("AnthropicProvider: no JSON object found in response");
  }
  const jsonStr = candidate.slice(start, end + 1);
  return JSON.parse(jsonStr);
}
