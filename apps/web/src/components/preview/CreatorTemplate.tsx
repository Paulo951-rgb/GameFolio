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
 * Creator template — warm, expressive, content-creator/streamer vibe with a
 * pink/coral accent and generous spacing. Presentation only: same data contract
 * as every other template.
 */
export function CreatorTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const c = resolveColors(theme, {
    primary: "#fb7185",
    accent: "#f59e0b",
    bg: "#160a14",
    text: "#f5e6eb",
  });
  const s = spacing(theme);
  const font = resolveFont(theme, "'Inter', system-ui, sans-serif");
  const { personalInfo: p, playerTypes, games, badges, achievements, generated } = data;

  const sectionTheme: SectionTheme = {
    primary: c.primary,
    text: c.text,
    headingClass: `mb-2 ${s.text} font-bold tracking-wide`,
    sectionClass: s.section,
  };

  return (
    <div
      className={`mx-auto max-w-[210mm] overflow-hidden rounded-2xl shadow-xl`}
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: font }}
    >
      {/* Banner header */}
      <div
        className={`${s.page} pb-4`}
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, ${c.primary}33, transparent 60%), radial-gradient(120% 80% at 100% 0%, ${c.accent}26, transparent 60%)`,
        }}
      >
        <header>
          <div className="flex items-center gap-4">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
                style={{ border: `2px solid ${c.primary}` }}
              />
            ) : (
              <div
                className="grid h-16 w-16 place-items-center rounded-full text-2xl font-black"
                style={{
                  background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
                  color: "#fff",
                }}
              >
                {(p.gamerTag || "G").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight">
                {p.gamerTag || "Pseudo joueur"}
              </h1>
              <div className={`mt-1 flex flex-wrap ${s.gap} text-sm opacity-80`}>
                {p.country && <span>📍 {p.country}</span>}
                {p.age != null && <span>🎂 {p.age} ans</span>}
                {p.languages?.length && <span>🗣 {p.languages.join(", ")}</span>}
                {p.platforms?.length && <span>🎮 {p.platforms.join(", ")}</span>}
              </div>
            </div>
          </div>

          {p.socials && Object.keys(p.socials).length > 0 && (
            <div className={`mt-3 flex flex-wrap ${s.gap} text-sm`}>
              {Object.entries(p.socials).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: `${c.primary}22`, color: c.primary }}
                >
                  {k}: {v}
                </span>
              ))}
            </div>
          )}
          <BioLine bio={p.bio} />
        </header>
      </div>

      <div className={s.page}>
        {playerTypes.length > 0 && (
          <section className={s.section}>
            <h2 className={sectionTheme.headingClass} style={{ color: c.primary }}>
              ✦ Profil de joueur
            </h2>
            <div className={`flex flex-wrap ${s.gap}`}>
              {playerTypes.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-3 py-1 text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
                    color: "#fff",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        <BadgesRow badges={badges} t={sectionTheme} />

        <GeneratedSections
          generated={generated}
          t={{
            primary: c.primary,
            text: c.text,
            headingClass: sectionTheme.headingClass,
            bodyClass: `${s.text} leading-relaxed opacity-90`,
            sectionClass: s.section,
          }}
        />

        {games.length > 0 && (
          <section>
            <h2 className={`mb-3 ${s.text} font-bold tracking-wide`} style={{ color: c.primary }}>
              ✦ Détail par jeu
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {games.map((entry, i) => {
                const game = getGame(entry.gameId);
                const fields = getResolvedGame(entry.gameId)?.fields;
                const entries = Object.entries(entry.moduleData).filter(
                  ([, val]) => !isEmptyValue(val),
                );
                return (
                  <article
                    key={`${entry.gameId}-${i}`}
                    className="rounded-xl p-4"
                    style={{
                      background: `${c.primary}0d`,
                      border: `1px solid ${c.primary}26`,
                    }}
                  >
                    <h3 className="text-lg font-bold" style={{ color: c.primary }}>
                      {game?.name ?? entry.gameId}
                    </h3>
                    {game?.genres?.length && (
                      <div className={`${s.text} opacity-60`}>{game.genres.join(" · ")}</div>
                    )}
                    {entries.length > 0 && (
                      <dl className={`mt-3 grid grid-cols-2 ${s.gap} ${s.text}`}>
                        {entries.map(([key, val]) => (
                          <div key={key}>
                            <dt className="opacity-50">{resolveFieldLabel(key, fields)}</dt>
                            <dd className="font-semibold">{formatValue(val)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {entry.freeText && (
                      <p className="mt-2 text-sm italic opacity-75">{entry.freeText}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {games.length === 0 && !generated && (
          <p className="py-12 text-center text-sm opacity-40">
            Ton aperçu apparaîtra ici au fur et à mesure ✦
          </p>
        )}

        <AchievementsList achievements={achievements} t={sectionTheme} />
      </div>
    </div>
  );
}
