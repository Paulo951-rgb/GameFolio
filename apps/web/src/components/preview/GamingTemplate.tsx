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
import { BadgesRow, AchievementsList, BioLine, type SectionTheme } from "./ProfileSections";

/**
 * Gaming template — dark, bold, neon-accented. Aimed at competitive/streamer
 * profiles. Presentation only: same data contract as every other template.
 */
export function GamingTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const c = resolveColors(theme, {
    primary: "#22d3ee",
    accent: "#f472b6",
    bg: "#020617",
    text: "#e2e8f0",
  });
  const s = spacing(theme);
  const font = resolveFont(theme, "Inter, sans-serif");
  const { personalInfo: p, playerTypes, games, badges, achievements, generated } = data;

  const sectionTheme: SectionTheme = {
    primary: c.accent,
    text: c.text,
    headingClass: `mb-2 ${s.text} font-bold uppercase tracking-widest`,
    sectionClass: s.section,
  };

  return (
    <div
      className={`mx-auto max-w-[210mm] ${s.page} shadow-xl`}
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: font }}
    >
      <header
        className="mb-6 border-b-2 pb-4"
        style={{ borderColor: c.primary }}
      >
        <h1 className="text-4xl font-black uppercase tracking-tight" style={{ color: c.primary }}>
          {p.gamerTag || "Pseudo joueur"}
        </h1>
        <div className={`mt-2 flex flex-wrap ${s.gap} text-sm opacity-80`}>
          {p.country && <span>📍 {p.country}</span>}
          {p.age != null && <span>🎂 {p.age} ans</span>}
          {p.languages?.length && <span>🗣 {p.languages.join(", ")}</span>}
          {p.platforms?.length && <span>🎮 {p.platforms.join(", ")}</span>}
        </div>
        {p.socials && Object.keys(p.socials).length > 0 && (
          <div className={`mt-2 flex flex-wrap ${s.gap} text-sm`}>
            {Object.entries(p.socials).map(([k, v]) => (
              <span key={k} style={{ color: c.accent }}>{k}: {v}</span>
            ))}
          </div>
        )}
        <BioLine bio={p.bio} />
      </header>

      {playerTypes.length > 0 && (
        <section className={s.section}>
          <h2 className={`mb-2 ${s.text} font-bold uppercase tracking-widest`} style={{ color: c.accent }}>
            ▸ Profil de joueur
          </h2>
          <div className={`flex flex-wrap ${s.gap}`}>
            {playerTypes.map((t) => (
              <span
                key={t}
                className="rounded px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: `${c.primary}22`, color: c.primary, border: `1px solid ${c.primary}55` }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      <BadgesRow badges={badges} t={sectionTheme} />

      {generated && (
        <GeneratedSections
          generated={generated}
          t={{
            primary: c.accent,
            text: c.text,
            headingClass: `mb-2 ${s.text} font-bold uppercase tracking-widest`,
            bodyClass: `${s.text} leading-relaxed opacity-90`,
            sectionClass: s.section,
            headingPrefix: "▸ ",
          }}
        />
      )}

      {games.length > 0 && (
        <section>
          <h2 className={`mb-3 ${s.text} font-bold uppercase tracking-widest`} style={{ color: c.accent }}>
            ▸ Détail par jeu
          </h2>
          <div className="space-y-3">
            {games.map((entry, i) => {
              const game = getGame(entry.gameId);
              const fields = getResolvedGame(entry.gameId)?.fields;
              const entries = Object.entries(entry.moduleData).filter(
                ([, val]) => !isEmptyValue(val),
              );
              return (
                <article
                  key={`${entry.gameId}-${i}`}
                  className="rounded-md p-4"
                  style={{ borderLeft: `4px solid ${c.primary}`, backgroundColor: `${c.primary}0d` }}
                >
                  <h3 className="text-xl font-bold" style={{ color: c.primary }}>
                    {game?.name ?? entry.gameId}
                  </h3>
                  {game?.publisher && <div className="text-xs opacity-60">{game.publisher}</div>}
                  {entries.length > 0 && (
                    <dl className={`mt-3 grid grid-cols-2 ${s.gap} text-sm`}>
                      {entries.map(([key, val]) => (
                        <div key={key}>
                          <dt className="opacity-50">{resolveFieldLabel(key, fields)}</dt>
                          <dd className="font-semibold">{formatValue(val)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {entry.freeText && <p className="mt-2 text-sm italic opacity-70">{entry.freeText}</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {games.length === 0 && !generated && (
        <p className="py-12 text-center text-sm opacity-40">Votre aperçu apparaîtra ici.</p>
      )}

      <AchievementsList achievements={achievements} t={sectionTheme} />
    </div>
  );
}
