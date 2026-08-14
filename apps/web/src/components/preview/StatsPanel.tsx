"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import { gameRegistry } from "@/lib/games";
import { computeProfileStats } from "@gamer-cv/core";

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
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Statistiques
      </h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <Stat label="Jeux" value={String(stats.totalGames)} />
        <Stat
          label="Heures totales"
          value={
            stats.gamesWithHours > 0
              ? `${stats.totalHours} h`
              : "—"
          }
          hint={
            stats.gamesWithHours > 0 && stats.gamesWithHours < stats.totalGames
              ? `sur ${stats.gamesWithHours} jeu(s) renseigné(s)`
              : undefined
          }
        />
        <Stat
          label="Heures moy."
          value={stats.averageHours !== null ? `${stats.averageHours} h` : "—"}
        />
        <Stat
          label="Genres dominants"
          value={stats.dominantGenres.length ? stats.dominantGenres.join(", ") : "—"}
        />
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-200">{value}</dd>
      {hint && <dd className="text-xs text-amber-400">{hint}</dd>}
    </div>
  );
}
