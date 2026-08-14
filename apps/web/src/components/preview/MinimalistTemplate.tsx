"use client";

import type { NormalizedCVData, ThemeConfig } from "@gamer-cv/types";
import { getGame, getResolvedGame } from "@/lib/games";
import {
  spacing,
  resolveColors,
  resolveFont,
  formatValue,
  isEmptyValue,
  resolveFieldLabel,
} from "./template-utils";
import { GeneratedSections } from "./GeneratedSections";

/**
 * Minimalist template — presentation-only. Receives the normalized, already
 * visibility-filtered CV data and renders it. Swapping templates never
 * changes which data is shown (that's the visibility engine's job).
 */
export function MinimalistTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const c = resolveColors(theme, {
    primary: "#8b5cf6",
    accent: "#8b5cf6",
    bg: "#0f172a",
    text: "#e2e8f0",
  });
  const s = spacing(theme);
  const font = resolveFont(theme, "Inter, sans-serif");
  const { personalInfo, playerTypes, games, generated } = data;

  return (
    <div
      className={`mx-auto max-w-[210mm] rounded-lg ${s.page} shadow-xl`}
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: font }}
    >
      <header className={`mb-6 border-b pb-4`} style={{ borderColor: `${c.primary}55` }}>
        <h1 className="text-3xl font-bold tracking-tight">
          {personalInfo.gamerTag || "Pseudo joueur"}
        </h1>
        <div className={`mt-1 flex flex-wrap ${s.gap} text-sm opacity-80`}>
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
          <div className={`mt-2 flex flex-wrap ${s.gap} text-sm opacity-80`}>
            {Object.entries(personalInfo.socials).map(([k, v]) => (
              <span key={k}>{k}: {v}</span>
            ))}
          </div>
        )}
      </header>

      {playerTypes.length > 0 && (
        <section className={s.section}>
          <h2 className={`mb-2 ${s.text} font-semibold uppercase tracking-wider`} style={{ color: c.primary }}>
            Profil de joueur
          </h2>
          <div className={`flex flex-wrap ${s.gap}`}>
            {playerTypes.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-sm"
                style={{ backgroundColor: `${c.primary}22`, color: c.primary }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      <GeneratedSections
        generated={generated}
        t={{
          primary: c.primary,
          text: c.text,
          headingClass: `mb-2 ${s.text} font-semibold uppercase tracking-wider`,
          bodyClass: `${s.text} leading-relaxed opacity-90`,
          sectionClass: s.section,
        }}
      />

      {games.length > 0 && (
        <section>
          <h2 className={`mb-3 ${s.text} font-semibold uppercase tracking-wider`} style={{ color: c.primary }}>
            Détail par jeu
          </h2>
          <div className="space-y-4">
            {games.map((entry, i) => {
              const game = getGame(entry.gameId);
              const fields = getResolvedGame(entry.gameId)?.fields;
              // Omit empty values (untouched fields) so the CV shows only what
              // the player actually filled in — no wall of "—" placeholders.
              const entries = Object.entries(entry.moduleData).filter(
                ([, val]) => !isEmptyValue(val),
              );
              return (
                <article
                  key={`${entry.gameId}-${i}`}
                  className="rounded-md border p-4"
                  style={{ borderColor: `${c.primary}33` }}
                >
                  <h3 className="text-lg font-semibold">
                    {game?.name ?? entry.gameId}
                  </h3>
                  {game?.publisher && (
                    <div className="text-xs opacity-60">{game.publisher}</div>
                  )}
                  {entries.length > 0 && (
                    <dl className={`mt-3 grid grid-cols-2 ${s.gap} text-sm`}>
                      {entries.map(([key, val]) => (
                        <div key={key}>
                          <dt className="opacity-50">{resolveFieldLabel(key, fields)}</dt>
                          <dd className="font-medium">{formatValue(val)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {entry.freeText && (
                    <p className="mt-3 text-sm italic opacity-75">{entry.freeText}</p>
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
