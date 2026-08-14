import {
  filterPersonalInfo,
  filterGameEntry,
} from "@gamer-cv/core";
import {
  GeneratedTextSchema,
  type GamerProfile,
  type GeneratedText,
  type NormalizedCVData,
} from "@gamer-cv/types";

/**
 * Build the visibility-filtered, normalized view of a profile. This is the
 * single chokepoint shared by:
 *  - LivePreviewPane (client)
 *  - the AI generation API routes (server, defense-in-depth: the server re-
 *    filters even though the client claims it already did, per §3 "jamais
 *    confiance aveugle dans les données client")
 *  - the future export/headless render (server)
 *
 * Private/hidden fields never survive this call, guaranteeing they can't reach
 * the AI prompt or the public page.
 */
export function normalizeProfile(profile: GamerProfile): NormalizedCVData {
  const personalInfo = filterPersonalInfo(profile.personalInfo);
  const games = profile.games
    .filter((g) => g.gameId !== "")
    .map((g) => filterGameEntry(g, profile.personalInfo.visibility))
    .filter((g): g is NonNullable<typeof g> => g !== null);
  return {
    personalInfo,
    playerTypes: profile.playerTypes,
    games,
    // Normalize generatedText so its array/object fields are real arrays/objects
    // (never undefined) even when the source is an older Prisma JSON column or a
    // stale IndexedDB blob. This protects the server-side render paths
    // (/cv/[slug], /export) that go through this chokepoint, in addition to the
    // client store entry points that also call normalizeGeneratedText directly.
    generated: normalizeGeneratedText(profile.generatedText),
  };
}

/**
 * Coerce an untrusted `generatedText` value into a schema-shaped
 * `GeneratedText` — guaranteeing that the array/object fields
 * (`strengths`, `specializations`, `games`, `perGame`) are real arrays/objects,
 * never `undefined`.
 *
 * WHY THIS EXISTS: `GeneratedTextSchema` declares those fields with
 * `.default([])` / `.default({})`, but Zod only applies defaults when the data
 * actually passes through `.parse()`. Several entry points inject a
 * `generatedText` that bypassed parsing:
 *   - IndexedDB hydration (`store.hydrate`) restoring a profile saved by an
 *     older app version or with a partial/legacy shape;
 *   - a cloud profile loaded from Prisma (`profile-mapper` casts the JSON column
 *     `as GeneratedText` with no validation);
 *   - a manually-edited object rebuilt by the inline editor spreads.
 * In all those cases the TS type lies (claims `string[]`) while the runtime
 * value is `undefined`, and the UI crashes on `generated.specializations.length`.
 *
 * This helper is the single chokepoint that makes the runtime match the type:
 *   - `undefined`/`null` → `undefined` (generatedText is genuinely optional);
 *   - a valid shape → the parsed value with all defaults applied;
 *   - a partial/legacy/foreign shape → a defensively rebuilt object that keeps
 *     any salvageable string content (summary / perGame) and defaults the rest,
 *     so the app never crashes on stale data.
 */
function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function asStringRecord(v: unknown): Record<string, string> {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string") out[k] = val;
    }
    return out;
  }
  return {};
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function normalizeGeneratedText(text: unknown): GeneratedText | undefined {
  if (text == null) return undefined;

  const parsed = GeneratedTextSchema.safeParse(text);
  if (parsed.success) return parsed.data;

  // Legacy / partial / foreign shape: salvage what we can and default the rest.
  // We do NOT trust unknown keys, and we never leave an array field undefined.
  const src = (text && typeof text === "object" ? text : {}) as Record<string, unknown>;
  const rebuilt: GeneratedText = {
    profileSummary: asString(src.profileSummary),
    gamingIdentity: asString(src.gamingIdentity),
    strengths: asStringArray(src.strengths),
    experience: asString(src.experience),
    specializations: asStringArray(src.specializations),
    performance: asString(src.performance),
    games: Array.isArray(src.games)
      ? src.games
          .map((g) => g as Record<string, unknown>)
          .filter((g) => g && typeof g === "object")
          .map((g) => ({
            gameId: typeof g.gameId === "string" ? g.gameId : "",
            title: asString(g.title),
            description: typeof g.description === "string" ? g.description : "",
            highlights: asStringArray(g.highlights),
          }))
          .filter((g) => g.gameId !== "" || g.description !== "")
      : [],
    summary: asString(src.summary),
    perGame: asStringRecord(src.perGame),
  };

  // Drop the rebuilt object if it carries no recognizable CV content, so an
  // entirely foreign blob doesn't render an empty generated block.
  const hasContent =
    Boolean(
      rebuilt.profileSummary ??
        rebuilt.gamingIdentity ??
        rebuilt.experience ??
        rebuilt.performance ??
        rebuilt.summary,
    ) ||
    rebuilt.strengths.length > 0 ||
    rebuilt.specializations.length > 0 ||
    rebuilt.games.length > 0 ||
    Object.keys(rebuilt.perGame).length > 0;
  return hasContent ? rebuilt : undefined;
}
