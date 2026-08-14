"use client";

import type { NormalizedCVData, ThemeConfig } from "@gamer-cv/types";
import { getGame } from "@/lib/games";

/**
 * Minimalist template — presentation-only. Receives the normalized, already
 * visibility-filtered CV data and renders it. Swapping templates never
 * changes which data is shown (that's the visibility engine's job).
 *
 * Phase 1 ships only this one template to validate the template engine; more
 * (Gaming, E-Sport, Néon…) arrive in Phase 4.
 */
export function MinimalistTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const primary = theme.primaryColor ?? "#8b5cf6";
  const bg = theme.backgroundColor ?? "#0f172a";
  const text = theme.textColor ?? "#e2e8f0";

  const { personalInfo, playerTypes, games, generated } = data;

  return (
    <div
      className="mx-auto max-w-[210mm] rounded-lg p-10 shadow-xl"
      style={{ backgroundColor: bg, color: text }}
    >
      <header className="mb-6 border-b pb-4" style={{ borderColor: `${primary}55` }}>
        <h1 className="text-3xl font-bold tracking-tight">
          {personalInfo.gamerTag || "Pseudo joueur"}
        </h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-80">
          {personalInfo.country && <span>📍 {personalInfo.country}</span>}
          {personalInfo.age != null && <span>🎂 {personalInfo.age} ans</span>}
          {personalInfo.languages?.length && (
            <span>🗣 {personalInfo.languages.join(", ")}</span>
          )}
          {personalInfo.platforms?.length && (
            <span>🎮 {personalInfo.platforms.join(", ")}</span>
          )}
        </div>
        {personalInfo.socials && Object.keys(personalInfo.socials).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3 text-sm opacity-80">
            {Object.entries(personalInfo.socials).map(([k, v]) => (
              <span key={k}>{k}: {v}</span>
            ))}
          </div>
        )}
      </header>

      {playerTypes.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
            Profil de joueur
          </h2>
          <div className="flex flex-wrap gap-2">
            {playerTypes.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-sm"
                style={{ backgroundColor: `${primary}22`, color: primary }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {generated?.summary && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
            Résumé
          </h2>
          <p className="text-sm leading-relaxed opacity-90">{generated.summary}</p>
        </section>
      )}

      {games.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
            Jeux
          </h2>
          <div className="space-y-4">
            {games.map((entry, i) => {
              const game = getGame(entry.gameId);
              const entries = Object.entries(entry.moduleData);
              return (
                <article
                  key={`${entry.gameId}-${i}`}
                  className="rounded-md border p-4"
                  style={{ borderColor: `${primary}33` }}
                >
                  <h3 className="text-lg font-semibold">
                    {game?.name ?? entry.gameId}
                  </h3>
                  {game?.publisher && (
                    <div className="text-xs opacity-60">{game.publisher}</div>
                  )}
                  {entries.length > 0 && (
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {entries.map(([key, val]) => (
                        <div key={key}>
                          <dt className="opacity-50">{formatLabel(key)}</dt>
                          <dd className="font-medium">{formatValue(val)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {entry.freeText && (
                    <p className="mt-3 text-sm italic opacity-75">{entry.freeText}</p>
                  )}
                  {generated?.perGame?.[entry.gameId] && (
                    <p className="mt-2 text-sm leading-relaxed opacity-90">
                      {generated.perGame[entry.gameId]}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {games.length === 0 && !generated && (
        <p className="py-12 text-center text-sm opacity-40">
          Votre aperçu apparaîtra ici au fur et à mesure.
        </p>
      )}
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatValue(val: unknown): string {
  if (Array.isArray(val)) return val.join(", ");
  if (val == null || val === "") return "—";
  return String(val);
}
