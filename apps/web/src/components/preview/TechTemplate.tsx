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
  resolveSectionOrder,
} from "./template-utils";
import { GeneratedSections } from "./GeneratedSections";
import { BadgesRow, AchievementsList, BioLine, type SectionTheme } from "./ProfileSections";

/**
 * Tech template — terminal/monospace inspired, structured grid, green-on-dark
 * accent. Aimed at builders/modders/tech-savvy players. Presentation only: same
 * data contract as every other template (no duplicated business logic).
 */
export function TechTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const c = resolveColors(theme, {
    primary: "#3ddc97",
    accent: "#5eead4",
    bg: "#0a0e1a",
    text: "#cbd5e1",
  });
  const s = spacing(theme);
  const font = resolveFont(theme, "'JetBrains Mono', ui-monospace, monospace");
  const { personalInfo: p, playerTypes, games, badges, achievements, generated } = data;

  const sectionTheme: SectionTheme = {
    primary: c.primary,
    text: c.text,
    headingClass: `mb-2 ${s.text} font-bold uppercase tracking-[0.15em]`,
    sectionClass: s.section,
  };

  return (
    <div
      className={`mx-auto max-w-[210mm] rounded-md ${s.page} shadow-xl`}
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: font }}
    >
      <header
        className="mb-6 border-b pb-4"
        style={{ borderColor: `${c.primary}40` }}
      >
        <div className={`${s.text} opacity-60`}>{"// player_profile.json"}</div>
        <h1 className="mt-1 text-3xl font-black" style={{ color: c.primary }}>
          {p.gamerTag || "Pseudo joueur"}
        </h1>
        <div className={`mt-2 flex flex-wrap ${s.gap} ${s.text} opacity-80`}>
          {p.country && <span>region: {p.country}</span>}
          {p.age != null && <span>age: {p.age}</span>}
          {p.languages?.length && <span>langs: [{p.languages.join(", ")}]</span>}
          {p.platforms?.length && <span>platforms: [{p.platforms.join(", ")}]</span>}
        </div>
        {p.socials && Object.keys(p.socials).length > 0 && (
          <div className={`mt-2 flex flex-wrap ${s.gap} ${s.text}`}>
            {Object.entries(p.socials).map(([k, v]) => (
              <span key={k} style={{ color: c.accent }}>{k}: "{v}"</span>
            ))}
          </div>
        )}
        <BioLine bio={p.bio} />
      </header>

      {(() => {
        const renderers: Record<string, React.ReactNode> = {
          playerTypes:
            playerTypes.length > 0 ? (
              <section className={s.section}>
                <h2 className={sectionTheme.headingClass} style={{ color: c.primary }}>
                  {"// playstyle"}
                </h2>
                <div className={`flex flex-wrap ${s.gap}`}>
                  {playerTypes.map((t) => (
                    <span
                      key={t}
                      className="rounded px-2.5 py-1 text-sm font-medium"
                      style={{
                        backgroundColor: `${c.primary}14`,
                        color: c.primary,
                        border: `1px solid ${c.primary}33`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            ) : null,
          badges: <BadgesRow badges={badges} t={sectionTheme} />,
          about: (
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
          ),
          games:
            games.length > 0 ? (
              <section>
                <h2 className={`mb-3 ${s.text} font-bold uppercase tracking-[0.15em]`} style={{ color: c.primary }}>
                  {"// games[]"}
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
                        style={{
                          borderLeft: `3px solid ${c.primary}`,
                          backgroundColor: `${c.primary}0a`,
                          border: `1px solid ${c.primary}22`,
                        }}
                      >
                        <h3 className="text-lg font-bold" style={{ color: c.primary }}>
                          {game?.name ?? entry.gameId}
                        </h3>
                        {game?.genres?.length && (
                          <div className={`${s.text} opacity-60`}>
                            {"// "}{game.genres.join(" · ")}
                          </div>
                        )}
                        {entries.length > 0 && (
                          <dl className={`mt-3 grid grid-cols-2 ${s.gap} ${s.text}`}>
                            {entries.map(([key, val]) => (
                              <div key={key}>
                                <dt className="opacity-50">{resolveFieldLabel(key, fields)}:</dt>
                                <dd className="font-semibold" style={{ color: c.accent }}>
                                  {formatValue(val)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {entry.freeText && (
                          <p className="mt-2 text-sm italic opacity-70">{entry.freeText}</p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null,
          achievements: <AchievementsList achievements={achievements} t={sectionTheme} />,
        };
        const nodes = resolveSectionOrder(theme)
          .map((id) => renderers[id] ?? null)
          .filter((n) => n !== null);
        if (nodes.length === 0) {
          return (
            <p className="py-12 text-center text-sm opacity-40">
              {"// en attente de données…"}
            </p>
          );
        }
        return nodes;
      })()}
    </div>
  );
}
