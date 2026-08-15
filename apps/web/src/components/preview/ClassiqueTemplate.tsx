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
 * Classique template — clean white background, serif type, professional résumé
 * feel. For portfolios / job-style CVs. Presentation only.
 */
export function ClassiqueTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const c = resolveColors(theme, {
    primary: "#1e293b",
    accent: "#0f766e",
    bg: "#ffffff",
    text: "#1e293b",
  });
  const s = spacing(theme);
  const font = resolveFont(theme, "Georgia, 'Times New Roman', serif");
  const { personalInfo: p, playerTypes, games, badges, achievements, generated } = data;

  const sectionTheme: SectionTheme = {
    primary: c.accent,
    text: c.text,
    headingClass: `mb-2 ${s.text} font-semibold uppercase tracking-wider border-b pb-1`,
    sectionClass: s.section,
  };

  return (
    <div
      className={`mx-auto max-w-[210mm] ${s.page} shadow-xl`}
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: font }}
    >
      <header className={`mb-6 text-center border-b pb-4 ${s.gap}`} style={{ borderColor: `${c.primary}33` }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: c.primary }}>
          {p.gamerTag || "Pseudo joueur"}
        </h1>
        <div className={`mt-2 flex flex-wrap justify-center ${s.gap} text-sm opacity-70`}>
          {p.country && <span>{p.country}</span>}
          {p.age != null && <span>{p.age} ans</span>}
          {p.languages?.length && <span>{p.languages.join(" · ")}</span>}
          {p.platforms?.length && <span>{p.platforms.join(" · ")}</span>}
        </div>
        {p.socials && Object.keys(p.socials).length > 0 && (
          <div className={`mt-2 flex flex-wrap justify-center ${s.gap} text-sm`} style={{ color: c.accent }}>
            {Object.entries(p.socials).map(([k, v]) => (
              <span key={k}>{k}: {v}</span>
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
                <h2 className={`mb-2 ${s.text} font-semibold uppercase tracking-wider border-b pb-1`} style={{ color: c.accent, borderColor: `${c.accent}33` }}>
                  Profil de joueur
                </h2>
                <p className={`${s.text} opacity-80`}>{playerTypes.join(" · ")}</p>
              </section>
            ) : null,
          badges: <BadgesRow badges={badges} t={sectionTheme} />,
          about: generated ? (
            <GeneratedSections
              generated={generated}
              t={{
                primary: c.accent,
                text: c.text,
                headingClass: `mb-2 ${s.text} font-semibold uppercase tracking-wider border-b pb-1`,
                bodyClass: `${s.text} leading-relaxed opacity-90`,
                sectionClass: s.section,
              }}
            />
          ) : null,
          games:
            games.length > 0 ? (
              <section>
                <h2 className={`mb-3 ${s.text} font-semibold uppercase tracking-wider border-b pb-1`} style={{ color: c.accent, borderColor: `${c.accent}33` }}>
                  Détail par jeu
                </h2>
                <div className="space-y-4">
                  {games.map((entry, i) => {
                    const game = getGame(entry.gameId);
                    const fields = getResolvedGame(entry.gameId)?.fields;
                    const entries = Object.entries(entry.moduleData).filter(
                      ([, val]) => !isEmptyValue(val),
                    );
                    return (
                      <article key={`${entry.gameId}-${i}`}>
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-lg font-bold" style={{ color: c.primary }}>
                            {game?.name ?? entry.gameId}
                          </h3>
                          {game?.publisher && <span className="text-xs italic opacity-60">{game.publisher}</span>}
                        </div>
                        {entries.length > 0 && (
                          <dl className={`mt-2 grid grid-cols-2 ${s.gap} text-sm`}>
                            {entries.map(([key, val]) => (
                              <div key={key}>
                                <dt className="italic opacity-50">{resolveFieldLabel(key, fields)}</dt>
                                <dd>{formatValue(val)}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {entry.freeText && <p className="mt-2 text-sm opacity-75">{entry.freeText}</p>}
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
          return <p className="py-12 text-center text-sm opacity-40">Votre aperçu apparaîtra ici.</p>;
        }
        return nodes;
      })()}
    </div>
  );
}
