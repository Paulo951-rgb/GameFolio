import type { ThemeConfig } from "@gamer-cv/types";

/**
 * Per-template default theme colors — the single source of truth, kept in a
 * NON "use client" module so BOTH server components (the /cv/[slug] public
 * page, the export route) and the client template registry can read them.
 *
 * Mirrors the defaults each template passes to `resolveColors`, lifted here so
 * a server-side render can paint a matching page background WITHOUT loading
 * the lazy template component. A user's themeConfig overrides take precedence.
 *
 * Do NOT add "use client" to this file: a plain function exported from a
 * "use client" module becomes a non-callable client reference when imported
 * into a server component (breaks /cv/[slug] with "x is not a function").
 */
export interface TemplateTheme {
  id: string;
  label: string;
  /** One-line French description shown in the template gallery (§10). */
  description: string;
  /** Short style tag (galerie) — e.g. "Sombre", "Néon". */
  style: string;
  defaultTheme: { primary: string; accent: string; bg: string; text: string };
}

export const TEMPLATE_THEMES: TemplateTheme[] = [
  {
    id: "minimalist",
    label: "Minimaliste",
    description: "Sombre épuré, focus sur les données. Le choix par défaut.",
    style: "Sombre",
    defaultTheme: { primary: "#8b5cf6", accent: "#8b5cf6", bg: "#0f172a", text: "#e2e8f0" },
  },
  {
    id: "gaming",
    label: "Gaming",
    description: "Accents néon vifs, pensé compétition / streamer.",
    style: "Néon",
    defaultTheme: { primary: "#22d3ee", accent: "#f472b6", bg: "#020617", text: "#e2e8f0" },
  },
  {
    id: "classique",
    label: "Classique",
    description: "Serif blanc, présentation résumé professionnel.",
    style: "Clair",
    defaultTheme: { primary: "#1e293b", accent: "#0f766e", bg: "#ffffff", text: "#1e293b" },
  },
  {
    id: "neon",
    label: "Néon",
    description: "Cyberpunk, texte lumineux sur fond quasi noir.",
    style: "Cyber",
    defaultTheme: { primary: "#f0abfc", accent: "#22d3ee", bg: "#0a0a0a", text: "#f5f5f5" },
  },
  {
    id: "tech",
    label: "Tech",
    description: "Verdâtre terminal, profil développeur / tech.",
    style: "Tech",
    defaultTheme: { primary: "#3ddc97", accent: "#5eead4", bg: "#0a0e1a", text: "#cbd5e1" },
  },
  {
    id: "creator",
    label: "Creator",
    description: "Chaleureux rose/orange, pour créateurs de contenu.",
    style: "Creator",
    defaultTheme: { primary: "#fb7185", accent: "#f59e0b", bg: "#160a14", text: "#f5e6eb" },
  },
];

export const TEMPLATE_THEME_MAP: ReadonlyMap<string, TemplateTheme> = new Map(
  TEMPLATE_THEMES.map((t) => [t.id, t]),
);

/**
 * Resolve the effective page/canvas background for a CV render: the user's
 * theme override wins, otherwise the active template's default. Safe to call
 * from server and client components alike (this module has no "use client").
 */
export function resolveTemplateBackground(theme: ThemeConfig): string {
  const def = TEMPLATE_THEME_MAP.get(theme.templateId) ?? TEMPLATE_THEMES[0];
  return theme.backgroundColor ?? def.defaultTheme.bg;
}
