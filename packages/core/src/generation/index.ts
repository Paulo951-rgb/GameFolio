import type {
  AIProvider,
  GenerationInput,
  GenerationOutput,
  GeneratedText,
  GenerationMode,
  GenerationPersonality,
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
 *  2. buildSystemPrompt     — strict role + explicit anti-invention instructions,
 *                              adapted to the requested mode & personality.
 *  3. generate + validate   — structured JSON output validated by GeneratedTextSchema.
 *  4. verifyFacts            — extract numbers/proper nouns from the generated text
 *                              and flag anything absent from the input data
 *                              (and from the game metadata the model was given).
 *  5. (retry once if facts fail) — delegated to the caller via retry policy.
 */

/**
 * Absolute anti-invention rules. The model may ANALYSE, SYNTHESIZE and DEDUCE
 * GENERAL tendencies from the data, but may never invent a specific fact
 * (statistic, rank, hours, competition, performance, reward, record, experience,
 * game, precise skill). Deducing a tendency ("profil orienté compétition") is
 * allowed; inventing a fact ("participe à des tournois e-sport") is not.
 */
export const SYSTEM_PROMPT = [
  "Tu es un expert qui rédige des CV gaming professionnels en français.",
  "Tu reçois les données structurées du profil d'un joueur, ENRICHIES du contexte de chaque jeu (nom, genres, modules, métadonnées : rangs/rôles/personnages/modes disponibles).",
  "TON OBJECTIF : ANALYSER le profil du joueur, comprendre ses expériences, détecter ses points forts, croiser les informations, puis RÉDIGER un vrai CV gamer — pas un simple reformatage des données.",
  "Tu DOIS comprendre le contexte de chaque jeu pour interpréter les valeurs (un rang, un niveau, un pourcentage n'ont pas la même signification selon le jeu).",
  "Tu PEUX : reformuler, synthétiser, organiser, déduire des TENDANCES GÉNÉRALES (ex. « profil orienté compétition »), mettre en valeur les informations, améliorer le style.",
  "RÈGLE ABSOLUE — INTERDICTION D'INVENTER : n'invente JAMAIS une statistique, un rang, un niveau, un nombre d'heures, un personnage, un rôle, une compétition, une performance, une récompense, un record, une expérience, un jeu ou une compétence précise qui n'est pas explicitement présent dans les données.",
  "Si une information est absente ou ambiguë, ne l'évoque pas. Une déduction générale reste autorisée, mais une déduction ne doit jamais devenir un fait précis non fourni (interdit : « participe à des compétitions e-sport » si le joueur ne l'a pas indiqué).",
  "Réponds UNIQUEMENT au format JSON structuré demandé, sans texte autour.",
].join(" ");

/**
 * Mode-specific guidance appended to the system prompt (§18).
 */
export const MODE_GUIDANCE: Record<GenerationMode, string> = {
  rapid: "MODE RAPIDE : présentation courte et percutante. Résumé concis, peu de détails.",
  standard: "MODE STANDARD : CV complet et équilibré couvrant toutes les sections.",
  detailed: "MODE DÉTAILLÉ : CV très complet, descriptions plus développées et riches.",
  competitive:
    "MODE COMPÉTITIF : mets davantage en avant les rangs, performances, compétition, rôles et statistiques.",
  portfolio:
    "MODE PORTFOLIO : mets davantage en avant les projets, créations, expériences et la polyvalence.",
};

/**
 * Personality-specific tone guidance appended to the system prompt (§19).
 */
export const PERSONALITY_GUIDANCE: Record<GenerationPersonality, string> = {
  professionnel: "TON : professionnel et soigné, vocabulaire mesuré.",
  gaming: "TON : gaming, énergique, vocabulaire du jeu vidéo assumé.",
  competitif: "TON : compétitif, axé performance et dépassement de soi.",
  sobre: "TON : sobre et factuel, phrases courtes, sans emphase.",
  dynamique: "TON : dynamique et engageant, rythme soutenu.",
  detaille: "TON : très détaillé, exhaustif, phrases plus longues.",
  court: "TON : court, allez à l'essentiel, formulations brèves.",
  naturel: "TON : naturel et fluide, comme une présentation parlée.",
};

/**
 * Build the full system prompt: base rules + mode + personality.
 */
export function buildSystemPrompt(
  mode?: GenerationMode,
  personality?: GenerationPersonality,
): string {
  const parts = [SYSTEM_PROMPT];
  if (mode) parts.push(MODE_GUIDANCE[mode]);
  if (personality) parts.push(PERSONALITY_GUIDANCE[personality]);
  return parts.join("\n\n");
}

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
    // Empty number inputs register as NaN (RHF valueAsNumber): never let NaN
    // reach the model — it would be an ambiguous, invented-looking value.
    (typeof v === "number" && Number.isNaN(v)) ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === "object" && v !== null && Object.keys(v).length === 0)
  );
}

/**
 * Context enrichment (§20). Attaches each game's metadata (name, genres,
 * modules, and the catalogue's ranks/roles/characters/modes...) to its entry
 * under a `__context` key, so the model can interpret field values per game
 * (a "Diamant" rank, a "Champion" level, a "100%" completion mean different
 * things). Also surfaces the per-game `freeText` (§11) at top level so it is
 * analyzed on the same footing as structured stats.
 *
 * Returns the enriched profileData AND a lowercased "meta blob" concatenating
 * every entity the model was legitimately allowed to see (game names, genres,
 * characters, ranks, roles, modes...). verifyFacts uses that blob to avoid
 * false-positives on entities the model referenced from the provided context.
 *
 * The registries are passed in (core must not import @gamer-cv/data).
 */
export function enrichForGeneration(
  profileData: Record<string, unknown>,
  gameRegistry: ReadonlyMap<string, import("@gamer-cv/types").GameDefinition>,
  moduleRegistry: ReadonlyMap<string, import("@gamer-cv/types").ModuleDefinition>,
): { enriched: Record<string, unknown>; gameMetaBlob: string } {
  const games = (profileData.games as Array<Record<string, unknown>> | undefined) ?? [];
  const metaParts: string[] = [];
  const enrichedGames = games.map((g) => {
    const gameId = String(g.gameId ?? "");
    const game = gameId ? gameRegistry.get(gameId) : undefined;
    if (!game) return g;
    metaParts.push(game.name);
    for (const genre of game.genres) metaParts.push(genre);
    if (game.aliases) for (const a of game.aliases) metaParts.push(a);
    const moduleLabels: string[] = [];
    const moduleFields: string[] = [];
    for (const mid of game.modules) {
      const mod = moduleRegistry.get(mid);
      if (!mod) continue;
      moduleLabels.push(mod.id);
      for (const f of mod.fields) {
        moduleFields.push(f.label);
        if (f.options) for (const o of f.options) moduleFields.push(o);
      }
    }
    const context: Record<string, unknown> = {
      name: game.name,
      genres: game.genres,
      modules: moduleLabels,
      fieldLabels: moduleFields,
      metadata: game.gameData,
    };
    if (game.publisher) context.publisher = game.publisher;
    if (game.developer) context.developer = game.developer;
    // Roll the catalogue entities into the meta blob too.
    for (const arr of Object.values(game.gameData)) {
      if (Array.isArray(arr)) for (const v of arr) metaParts.push(String(v));
    }
    return { ...g, __context: context };
  });

  const enriched = { ...profileData, games: enrichedGames };
  return { enriched, gameMetaBlob: metaParts.join(" ") };
}

/**
 * Small French stopword set for proper-noun fact verification. Capitalized
 * common words at sentence start (Le, Ce, Profil, Joueur, ...) must NOT be
 * flagged as hallucinations — only genuine entity-like tokens should be.
 * Lowercased, accented forms included.
 */
const COMMON_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "ce", "cet", "cette", "ces",
  "et", "ou", "mais", "donc", "car", "ni", "or", "ainsi", "puis", "ensuite",
  "avec", "sans", "sous", "sur", "dans", "pour", "par", "vers", "chez", "entre",
  "qui", "que", "quoi", "dont", "où", "comme", "quand", "comment", "pourquoi",
  "il", "elle", "ils", "elles", "on", "nous", "vous", "je", "tu", "son", "sa",
  "ses", "leur", "leurs", "notre", "votre", "mes", "tes", "nos", "vos",
  "est", "sont", "été", "être", "a", "ont", "avait", "avait", "fait", "faire",
  "plus", "moins", "très", "trop", "aussi", "encore", "déjà", "bien", "mal",
  "profil", "joueur", "joueurs", "jeu", "jeux", "gaming", "gamer", "cv",
  "gamer", "expérience", "competiteur", "compétiteur", "explorateur", "social",
  "acheveur", "créatif", "narratif", "points", "fort", "forts", "fortes",
  "forte", "spécialisations", "spécialisation", "performances", "performance",
  "présentation", "résumé", "resume", "description", "jeux", "section",
  "partie", "monde", "mondes", "niveau", "niveaux", "rang", "rangs", "rôle",
  "rôles", "role", "roles", "agent", "agents", "personnage", "personnages",
  "arme", "armes", "équipe", "equipe", "clan", "guilde", "serveur", "serveurs",
  "mode", "modes", "solo", "team", "saison", "saisons", "acte", "episode",
  "épisode", "hours", "heures", "heure", "ans", "an", "via", "etc",
]);

/**
 * Step 4: fact verification. Extract candidate facts from the generated text:
 *  - numbers (incl. decimals, percents, K/D ratios) → flagged if the exact
 *    number substring is absent from the input blob.
 *  - capitalized tokens (potential proper nouns / entity names) → flagged only
 *    if absent from the input blob AND not a common French word AND not found
 *    in the game metadata blob. This avoids false positives on real AI output
 *    ("Le", "Profil", sentence-initial words) while still catching invented
 *    ranks/characters/games.
 *
 * `gameMetaBlob` is an optional lowercased concatenation of all game metadata
 * (names, genres, characters, ranks, roles, ...) the model was allowed to see,
 * so a legitimately referenced entity isn't flagged.
 */
export function verifyFacts(
  generated: GeneratedText,
  inputData: Record<string, unknown>,
  gameMetaBlob = "",
): string[] {
  const inputBlob = JSON.stringify(inputData).toLowerCase();
  const metaBlob = gameMetaBlob.toLowerCase();
  const allowed = (token: string): boolean =>
    inputBlob.includes(token) || metaBlob.includes(token);

  const sections = [
    generated.profileSummary,
    generated.gamingIdentity,
    generated.experience,
    generated.performance,
    generated.summary,
    (generated.strengths ?? []).join(" "),
    (generated.specializations ?? []).join(" "),
    (generated.games ?? [])
      .map((g) => `${g.description} ${(g.highlights ?? []).join(" ")}`)
      .join(" "),
    Object.values(generated.perGame ?? {}).join(" "),
  ];
  const text = sections.filter(Boolean).join(" ");

  const suspicious: string[] = [];

  // Numbers (including decimals, ratios like 1.5, percents, ranks like "2").
  const numberMatches = text.match(/\b\d+(?:[.,]\d+)?\b/g) ?? [];
  for (const n of numberMatches) {
    // Accept the number if it appears verbatim OR its dot/comma variant does.
    const variants = [n, n.replace(".", ","), n.replace(",", ".")];
    if (!variants.some((v) => allowed(v))) suspicious.push(n);
  }

  // Proper-noun-like tokens: Capitalized sequences of >=3 letters.
  const nounMatches = text.match(/\b[A-Z][a-zA-Zàâäéèêëïîôöùûüç]{2,}\b/g) ?? [];
  for (const noun of nounMatches) {
    const lower = noun.toLowerCase();
    if (COMMON_WORDS.has(lower)) continue;
    if (allowed(lower)) continue;
    suspicious.push(noun);
  }

  return [...new Set(suspicious)];
}

/**
 * Run the full pipeline against a provider. Returns the generated text plus a
 * list of facts flagged as "à vérifier". The provider must return structured
 * JSON matching GeneratedTextSchema; otherwise we throw (caller decides retry).
 *
 * `gameMetaBlob` (optional) is the lowercased concatenation of game metadata
 * the model was allowed to see; verifyFacts uses it so a legitimately
 * referenced entity (rank/character/role from the catalogue) is not flagged.
 */
export async function runGeneration(
  provider: AIProvider,
  input: GenerationInput,
  gameMetaBlob = "",
): Promise<{ text: GeneratedText; flaggedFacts: string[] }> {
  const serialized = serializeProfile(input.profileData);
  const systemPrompt = input.systemPrompt || buildSystemPrompt(input.mode, input.personality);
  const output: GenerationOutput = await provider.generate({
    systemPrompt,
    profileData: serialized,
    instruction: input.instruction,
    mode: input.mode,
    personality: input.personality,
  });

  const parsed = GeneratedTextSchema.safeParse(output.structured);
  if (!parsed.success) {
    throw new GenerationFormatError(parsed.error);
  }
  const flaggedFacts = verifyFacts(parsed.data, serialized, gameMetaBlob);
  return { text: parsed.data, flaggedFacts };
}

export class GenerationFormatError extends Error {
  constructor(public readonly zodError: z.ZodError) {
    super("AI output did not match the structured schema");
    this.name = "GenerationFormatError";
  }
}
