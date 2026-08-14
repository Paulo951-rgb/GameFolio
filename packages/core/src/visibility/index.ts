import type {
  FieldVisibility,
  PersonalInfo,
  GameEntry,
  VisibilityMap,
} from "@gamer-cv/types";

/**
 * Visibility engine — enforces per-field visibility BEFORE any public exposure
 * or AI prompt construction.
 *
 *  - visible : exposed on the public page and sent to the AI generator
 *  - hidden  : omitted from the public page AND from AI generation
 *  - private : stored but rendered only to the owner (never public, never AI)
 *
 * For external exposure (public page or AI prompt) `hidden` and `private` are
 * both stripped — only `visible` passes. They differ semantically (a "hidden"
 * field is temporarily off, a "private" field is intentionally kept to the
 * owner) but filter identically, so there is no public-vs-AI mode parameter:
 * the same filter protects both surfaces. This is the single chokepoint that
 * guarantees a private/hidden field never reaches the /cv/[slug] page or the
 * generation pipeline (solution #7).
 */

/**
 * Resolve the effective visibility for a field key. Defaults to "visible" when
 * the key is absent from the visibility map (so adding a new field doesn't
 * require migrating every stored profile).
 */
export function resolveVisibility(
  visibility: VisibilityMap | undefined,
  key: string,
): FieldVisibility {
  return visibility?.[key] ?? "visible";
}

/**
 * Strip a record down to the keys that are allowed to leave storage.
 * Only `visible` keys survive; `hidden` and `private` are removed.
 */
export function filterRecord(
  record: Record<string, unknown>,
  visibility: VisibilityMap | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (resolveVisibility(visibility, key) === "visible") {
      out[key] = value;
    }
  }
  return out;
}

export function filterPersonalInfo(info: PersonalInfo): PersonalInfo {
  const { visibility, ...rest } = info;
  const filtered = filterRecord(rest as Record<string, unknown>, visibility);
  // visibility map itself is metadata, never exposed in the public/AI payload.
  return filtered as unknown as PersonalInfo;
}

export function filterGameEntry(
  entry: GameEntry,
  visibility: VisibilityMap | undefined,
): GameEntry | null {
  const filteredModuleData = filterRecord(entry.moduleData, visibility);
  // A game whose every field is hidden/private yields an empty entry; drop it
  // from public/AI views entirely rather than render an empty section.
  if (Object.keys(filteredModuleData).length === 0 && !entry.freeText) {
    return null;
  }
  return {
    ...entry,
    moduleData: filteredModuleData,
  };
}
