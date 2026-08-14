import type { ThemeConfig } from "@gamer-cv/types";

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
