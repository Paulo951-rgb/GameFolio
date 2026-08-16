import type { NormalizedCVData, ThemeConfig } from "@gamer-cv/types";
import { TEMPLATE_THEMES } from "@/components/preview/template-themes";

/**
 * Demo CV data for landing-page template thumbnails. Clearly labelled
 * "Exemple" — never presented as a real player's profile. Kept minimal but
 * schema-shaped so every template renders realistic structure (header, games,
 * badges, achievements) instead of an abstract swatch.
 *
 * Values are obviously placeholders so nothing reads as real player data.
 */
export const demoProfile: NormalizedCVData = {
  personalInfo: {
    gamerTag: "Exemple",
    age: undefined,
    country: "FR",
    languages: ["Français", "English"],
    platforms: ["PC"],
    bio: "Joueur compétitif multi-jeux — exemple de profil.",
    socials: {},
    visibility: {},
  },
  playerTypes: ["Compétitif", "FPS"],
  games: [
    {
      gameId: "valorant",
      moduleData: { hours: 800, currentRank: "Diamant 2", roles: ["Duelist"] },
      order: 0,
    },
  ],
  badges: [
    { id: "competitive", name: "COMPETITIVE", description: "Joueur classé", icon: "🏆", category: "playstyle" },
    { id: "fps-main", name: "FPS MAIN", description: "Spécialiste FPS", icon: "🎯", category: "playstyle" },
  ],
  achievements: [
    { id: "a1", title: "Diamant atteint", gameId: "valorant", date: "2024", description: "Exemple" },
  ],
  generated: undefined,
};

/** Default theme for a template id (used to render each thumbnail faithfully).
 *  TEMPLATE_THEMES stores a short internal palette ({primary, accent, bg,
 *  text}); we map it onto a full ThemeConfig so CVTemplate + every template's
 *  resolveColors see the keys they expect. */
export function defaultThemeFor(templateId: string): ThemeConfig {
  const def = TEMPLATE_THEMES.find((t) => t.id === templateId);
  if (!def) return { templateId };
  return {
    templateId: def.id,
    primaryColor: def.defaultTheme.primary,
    accentColor: def.defaultTheme.accent,
    backgroundColor: def.defaultTheme.bg,
    textColor: def.defaultTheme.text,
  };
}
