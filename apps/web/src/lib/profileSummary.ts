import type { PersonalInfo } from "@gamer-cv/types";

/**
 * Profile completion estimate (0–100) for the dashboard. Counts filled
 * "meaningful" fields across identity, player types, games and achievements,
 * then weights them. Used only as a guidance indicator — never gates anything.
 * No invented data; a missing field simply lowers the score.
 */
export function profileCompletion(
  profile: {
    personalInfo: PersonalInfo;
    playerTypes: string[];
    games: { gameId: string; moduleData?: Record<string, unknown>; freeText?: string }[];
    achievements?: unknown[];
    generatedText?: unknown;
  },
): number {
  const info = profile.personalInfo;
  const identity = [
    info.gamerTag,
    info.bio,
    info.country,
    info.avatarUrl,
    (info.platforms?.length ?? 0) > 0,
    (info.languages?.length ?? 0) > 0,
  ];
  const identityScore = identity.filter(Boolean).length / identity.length;

  const hasTypes = profile.playerTypes.length > 0 ? 1 : 0;
  const games = profile.games.filter((g) => g.gameId);
  const gamesScore = games.length === 0 ? 0 : Math.min(1, games.length / 3);
  // Per-game richness: how many non-empty module fields + freeText on average.
  const richness =
    games.length === 0
      ? 0
      : Math.min(
          1,
          games.reduce((acc, g) => {
            const filled = Object.values(g.moduleData ?? {}).filter(
              (v) => v !== "" && v != null && !(Array.isArray(v) && v.length === 0),
            ).length;
            return acc + (filled + (g.freeText ? 1 : 0)) / 4;
          }, 0) / games.length,
        );
  const achScore = (profile.achievements?.length ?? 0) > 0 ? 1 : 0;
  const aiScore = profile.generatedText ? 1 : 0;

  const weighted =
    identityScore * 0.3 +
    hasTypes * 0.05 +
    gamesScore * 0.25 +
    richness * 0.2 +
    achScore * 0.1 +
    aiScore * 0.1;
  return Math.round(weighted * 100);
}
