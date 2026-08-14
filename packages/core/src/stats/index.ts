import type {
  GameEntry,
  GamerProfile,
  GameRegistry,
  ProfileStats,
} from "@gamer-cv/types";

/**
 * Compute aggregated stats over a profile's games (architecture doc Phase 6).
 *
 * STRICT NON-AGGREGATION RULE (risk #2 / solution #2): we only ever aggregate
 * values that are actually present. A game without a numeric `hours` is dropped
 * from the sum/average (and counted in the denominator via totalGames so a
 * consumer can tell partial coverage from complete). Genres come ONLY from the
 * game definition's `genres` field, looked up via the registry — we never
 * guess a genre for an unknown game (it simply contributes no genre). No stat
 * invents, rounds-up, or infers anything.
 *
 * `hours` may live in any module's `moduleData` (several modules declare it).
 * We read it generically as `moduleData.hours` and only count it when it's a
 * finite, non-negative number.
 */
export function computeProfileStats(
  profile: GamerProfile,
  gameRegistry: GameRegistry,
): ProfileStats {
  const games = profile.games.filter((g) => g.gameId !== "");

  let totalHours = 0;
  let gamesWithHours = 0;
  const genreCounts: Record<string, number> = {};

  for (const entry of games) {
    const hours = extractHours(entry);
    if (hours !== null) {
      totalHours += hours;
      gamesWithHours += 1;
    }
    const game = gameRegistry.get(entry.gameId);
    if (game) {
      for (const genre of game.genres) {
        genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
      }
    }
    // Unknown game ids contribute neither hours-skip-penalty nor genres: we
    // simply have no facts about them, so we don't fabricate any.
  }

  const averageHours = gamesWithHours > 0 ? totalHours / gamesWithHours : null;

  const dominantGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([g]) => g);

  return {
    totalGames: games.length,
    totalHours: round2(totalHours),
    gamesWithHours,
    averageHours: averageHours === null ? null : round2(averageHours),
    genreCounts,
    dominantGenres,
    playerTypes: profile.playerTypes,
  };
}

/** Extract a non-negative finite `hours` from a game entry's moduleData, else null. */
function extractHours(entry: GameEntry): number | null {
  const raw = entry.moduleData?.hours;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) {
    return null;
  }
  return raw;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
