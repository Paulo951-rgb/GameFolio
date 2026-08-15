import type {
  GamerProfile,
  GameRegistry,
  Badge,
  GameEntry,
} from "@gamer-cv/types";

/**
 * Badges engine — badges a player EARNS because a verifiable condition holds
 * against their REAL data (architecture §11). A badge is NEVER attributed when
 * its condition isn't met. Conditions read only from values actually present
 * (hours, ranks, game count, player types, achievements) — they never infer,
 * round up, or fabricate.
 *
 * `hours` and competitive stats live generically in each game's moduleData
 * (several modules declare `hours`, `currentRank`, `highestRank`, `kdRatio`…)
 * so we read them defensively via optional accessors below.
 *
 * Adding a badge = push a new entry to BADGE_DEFINITIONS + a predicate. The UI
 * and templates consume the result generically; no per-badge UI code.
 */

interface BadgeDefinition {
  badge: Badge;
  /** True only when the condition is verifiably met by the real data. */
  earned: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  profile: GamerProfile;
  games: GameEntry[];
  totalHours: number;
  gamesWithHours: number;
  hasCompetitiveGame: boolean;
  hasRankedPeak: boolean;
  distinctGenres: Set<string>;
  achievementCount: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    badge: {
      id: "thousand-hours",
      name: "1000+ Heures",
      description: "Plus de 1000 heures de jeu renseignées au total",
      icon: "⏱️",
      category: "volume",
    },
    earned: (c) => c.totalHours >= 1000,
  },
  {
    badge: {
      id: "five-hundred-hours",
      name: "500+ Heures",
      description: "Plus de 500 heures de jeu renseignées au total",
      icon: "🕐",
      category: "volume",
    },
    earned: (c) => c.totalHours >= 500,
  },
  {
    badge: {
      id: "competitive",
      name: "Compétitif",
      description: "Au moins un jeu compétitif avec un rang renseigné",
      icon: "🎯",
      category: "playstyle",
    },
    earned: (c) => c.hasCompetitiveGame,
  },
  {
    badge: {
      id: "peak-ranked",
      name: "Ranked Peak",
      description: "Un meilleur rang (peak) a été enregistré",
      icon: "📈",
      category: "competition",
    },
    earned: (c) => c.hasRankedPeak,
  },
  {
    badge: {
      id: "fps-main",
      name: "FPS Main",
      description: "Possède au moins un jeu FPS dans son profil",
      icon: "🔫",
      category: "mastery",
    },
    earned: (c) => c.distinctGenres.has("FPS"),
  },
  {
    badge: {
      id: "sandbox-builder",
      name: "Builder",
      description: "Possède au moins un jeu sandbox / créatif",
      icon: "🧱",
      category: "mastery",
    },
    earned: (c) => c.distinctGenres.has("sandbox") || c.distinctGenres.has("créatif"),
  },
  {
    badge: {
      id: "multigame",
      name: "Multigame",
      description: "Au moins 3 jeux différents dans le profil",
      icon: "🎲",
      category: "diversity",
    },
    earned: (c) => c.games.length >= 3,
  },
  {
    badge: {
      id: "achievement-hunter",
      name: "Achievement Hunter",
      description: "Au moins 3 achievements renseignés",
      icon: "🏆",
      category: "diversity",
    },
    earned: (c) => c.achievementCount >= 3,
  },
  {
    badge: {
      id: "tournament-player",
      name: "Tournament Player",
      description: "Une expérience compétitive / tournoi est mentionnée",
      icon: "🥇",
      category: "competition",
    },
    // Reads the competitive module's `competitiveExperience` free text, which
    // the player fills explicitly — we never infer tournament participation.
    earned: (c) =>
      c.games.some((g) => {
        const v = g.moduleData?.competitiveExperience;
        return typeof v === "string" && v.trim().length > 0;
      }),
  },
  {
    badge: {
      id: "collector",
      name: "Collector",
      description: "Au moins 5 jeux dans son profil",
      icon: "🧬",
      category: "diversity",
    },
    earned: (c) => c.games.length >= 5,
  },
];

function buildContext(profile: GamerProfile, registry: GameRegistry): BadgeContext {
  const games = profile.games.filter((g) => g.gameId !== "");
  let totalHours = 0;
  let gamesWithHours = 0;
  let hasCompetitiveGame = false;
  let hasRankedPeak = false;
  const distinctGenres = new Set<string>();

  for (const entry of games) {
    const hours = extractNumber(entry.moduleData?.hours);
    if (hours !== null) {
      totalHours += hours;
      gamesWithHours += 1;
    }
    if (
      typeof entry.moduleData?.currentRank === "string" &&
      entry.moduleData.currentRank.trim() !== ""
    ) {
      hasCompetitiveGame = true;
    }
    if (
      typeof entry.moduleData?.highestRank === "string" &&
      entry.moduleData.highestRank.trim() !== ""
    ) {
      hasRankedPeak = true;
    }
    const game = registry.get(entry.gameId);
    if (game) {
      for (const genre of game.genres) distinctGenres.add(genre);
    }
  }

  return {
    profile,
    games,
    totalHours,
    gamesWithHours,
    hasCompetitiveGame,
    hasRankedPeak,
    distinctGenres,
    achievementCount: profile.achievements?.length ?? 0,
  };
}

function extractNumber(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  return v;
}

/**
 * Compute the badges a player has earned from their real data. Returns ONLY
 * badges whose condition is verifiably met — never a partial/attributed badge.
 */
export function computeBadges(
  profile: GamerProfile,
  registry: GameRegistry,
): Badge[] {
  const ctx = buildContext(profile, registry);
  return BADGE_DEFINITIONS.filter((d) => d.earned(ctx)).map((d) => d.badge);
}

/** The full badge catalogue (for "locked" previews in the UI). */
export function allBadges(): Badge[] {
  return BADGE_DEFINITIONS.map((d) => d.badge);
}
