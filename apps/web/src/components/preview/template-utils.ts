import { CV_SECTION_IDS, type ThemeConfig, type CVSectionId } from "@gamer-cv/types";

/**
 * Shared presentation helpers for CV templates. Templates are pure
 * presentation (architecture §7): they receive NormalizedCVData + ThemeConfig
 * and render. These helpers keep every template consistent (density, labels,
 * value formatting) without duplicating logic.
 */

/** Tailwind-style spacing scale driven by the theme density. */
export function spacing(theme: ThemeConfig): {
  page: string;
  section: string;
  gap: string;
  text: string;
} {
  switch (theme.density) {
    case "compact":
      return { page: "p-4", section: "mb-3", gap: "gap-1", text: "text-xs" };
    case "spacious":
      return { page: "p-12", section: "mb-8", gap: "gap-4", text: "text-base" };
    default:
      return { page: "p-8", section: "mb-5", gap: "gap-2", text: "text-sm" };
  }
}

/** Resolve theme colors with sensible per-template defaults. */
export function resolveColors(
  theme: ThemeConfig,
  defaults: { primary: string; accent: string; bg: string; text: string },
) {
  return {
    primary: theme.primaryColor ?? defaults.primary,
    accent: theme.accentColor ?? defaults.accent,
    bg: theme.backgroundColor ?? defaults.bg,
    text: theme.textColor ?? defaults.text,
  };
}

/** Font family stack from the theme, falling back to a default. */
export function resolveFont(theme: ThemeConfig, fallback: string): string {
  return theme.fontFamily ?? fallback;
}

/** Humanize a camelCase module field key as a label. */
export function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/** Stringify a module value for display. */
export function formatValue(val: unknown): string {
  if (Array.isArray(val)) return val.join(", ");
  if (val == null || val === "") return "—";
  // Empty number inputs register as NaN (RHF valueAsNumber); never show "NaN".
  if (typeof val === "number" && Number.isNaN(val)) return "—";
  return String(val);
}

/**
 * True when a module value carries no information (empty string, empty array,
 * null, undefined, NaN). Templates use this to OMIT such entries from the
 * "Détail par jeu" table instead of rendering a row of "—" placeholders, which
 * cluttered the CV with every unused field of every game.
 */
export function isEmptyValue(val: unknown): boolean {
  if (val == null) return true;
  if (val === "") return true;
  if (typeof val === "number" && Number.isNaN(val)) return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

/**
 * Resolve a module field key to a human label, preferring the module's own
 * `label` (French, curated — e.g. "Ratio K/D") over the generic camelCase
 * humanization (e.g. "Kd Ratio"). `resolvedFields` is the `fields` array from
 * `getResolvedGame(gameId).fields` (or any FieldDescriptor[]).
 */
export function resolveFieldLabel(
  key: string,
  resolvedFields?: { key: string; label?: string }[],
): string {
  const found = resolvedFields?.find((f) => f.key === key);
  return found?.label ?? formatLabel(key);
}

/**
 * Resolve the ordered, visible list of CV section ids for a theme.
 *
 * - Starts from `theme.sectionOrder` if set; any canonical id missing from it
 *   is appended in canonical order (so adding a new section id later can't
 *   silently drop it from existing profiles).
 * - Unknown ids in sectionOrder are dropped (defensive against stale/foreign
 *   persisted data).
 * - Removes anything in `theme.hiddenSections`.
 * - Returns the canonical order when sectionOrder is unset (default).
 *
 * Templates iterate this list and render their styled block per id; the header
 * (identity) is always rendered separately and is NOT part of this list.
 */
export function resolveSectionOrder(theme: ThemeConfig): CVSectionId[] {
  const hidden = new Set(theme.hiddenSections ?? []);
  const valid = new Set<string>(CV_SECTION_IDS);
  const ordered = (theme.sectionOrder ?? [...CV_SECTION_IDS]).filter(
    (id) => valid.has(id) && !hidden.has(id),
  );
  // Append any canonical id that wasn't explicitly ordered (and isn't hidden).
  for (const id of CV_SECTION_IDS) {
    if (!ordered.includes(id) && !hidden.has(id)) ordered.push(id);
  }
  return ordered as CVSectionId[];
}
