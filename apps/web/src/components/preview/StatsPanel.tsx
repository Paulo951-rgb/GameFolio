"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import { gameRegistry } from "@/lib/games";
import { computeProfileStats } from "@gamer-cv/core";
import { Card, StatTile } from "@/components/ui";

/**
 * StatsPanel — aggregated stats over the in-progress profile's games. Pure
 * client computation (the game registry ships to the client). Honours the
 * non-aggregation rule: "X jeux dont N avec heures renseignées" so partial
 * coverage is never mistaken for complete.
 */
export function StatsPanel() {
  const profile = useEditorStore((s) => s.profile);

  const stats = useMemo(
    () => computeProfileStats(profile, gameRegistry),
    [profile],
  );

  if (stats.totalGames === 0) return null;

  return (
    <Card surface="2" className="p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
        Statistiques
      </h3>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Jeux" value={stats.totalGames} />
        <StatTile
          label="Heures totales"
          value={stats.gamesWithHours > 0 ? `${stats.totalHours} h` : "—"}
          hint={
            stats.gamesWithHours > 0 && stats.gamesWithHours < stats.totalGames
              ? `sur ${stats.gamesWithHours} jeu(x) renseigné(s)`
              : undefined
          }
        />
        <StatTile
          label="Heures moy."
          value={stats.averageHours !== null ? `${stats.averageHours} h` : "—"}
        />
        <StatTile
          label="Genres dominants"
          value={stats.dominantGenres.length ? stats.dominantGenres.join(", ") : "—"}
        />
      </dl>
    </Card>
  );
}
