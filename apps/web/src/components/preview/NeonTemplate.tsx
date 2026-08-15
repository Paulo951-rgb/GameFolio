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
 * Néon template — cyberpunk, glowing text/edges on near-black. Bold and high
 * contrast. Presentation only.
 */
export function NeonTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const c = resolveColors(theme, {
    primary: "#f0abfc",
    accent: "#22d3ee",
    bg: "#0a0a0a",
    text: "#f5f5f5",
  });
  const s = spacing(theme);
  const font = resolveFont(theme, "'JetBrains Mono', ui-monospace, monospace");
  const { personalInfo: p, playerTypes, games, badges, achievements, generated } = data;
  const glow = `0 0 8px ${c.primary}, 0 0 16px ${c.primary}55`;

  const sectionTheme: SectionTheme = {
    primary: c.accent,
    text: c.text,
    headingClass: `mb-2 ${s.text} font-bold uppercase tracking-[0.2em]`,
    sectionClass: s.section,
  };

  return (
    <div
      className={`mx-auto max-w-[210mm] ${s.page}`}
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: font }}
    >
      <header className="mb-6 border-b pb-4" style={{ borderColor: c.primary, boxShadow: `0 2px 12px -2px ${c.primary}` }}>
        <h1
          className="text-4xl font-black uppercase"
          style={{ color: c.primary, textShadow: glow }}
        >
          {p.gamerTag || "Pseudo joueur"}
        </h1>
        <div className={`mt-2 flex flex-wrap ${s.gap} text-sm`} style={{ color: c.accent }}>
          {p.country && <span>⟦{p.country}⟧</span>}
          {p.age != null && <span>⟦{p.age} yrs⟧</span>}
          {p.languages?.length && <span>⟦{p.languages.join("/")}⟧</span>}
          {p.platforms?.length && <span>⟦{p.platforms.join("/")}⟧</span>}
        </div>
        {p.socials && Object.keys(p.socials).length > 0 && (
          <div className={`mt-2 flex flex-wrap ${s.gap} text-sm opacity-80`}>
            {Object.entries(p.socials).map(([k, v]) => (
              <span key={k} style={{ color: c.accent }}>{k}: {v}</span>
            ))}
          </div>
        )}
        <BioLine bio={p.bio} />
      </header>

      {playerTypes.length > 0 && (
        <section className={s.section}>
          <h2 className={`mb-2 ${s.text} font-bold uppercase tracking-[0.2em]`} style={{ color: c.accent, textShadow: `0 0 6px ${c.accent}88` }}>
            // Profil
          </h2>
          <div className={`flex flex-wrap ${s.gap}`}>
            {playerTypes.map((t) => (
              <span
                key={t}
                className="rounded-sm px-3 py-1 text-sm font-bold uppercase"
                style={{ border: `1px solid ${c.primary}`, color: c.primary, textShadow: glow }}
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
            headingClass: `mb-2 ${s.text} font-bold uppercase tracking-[0.2em]`,
            bodyClass: `${s.text} leading-relaxed opacity-90`,
            sectionClass: s.section,
            headingPrefix: "// ",
            headingStyle: { textShadow: `0 0 6px ${c.accent}88` },
          }}
        />
      )}

      {games.length > 0 && (
        <section>
          <h2 className={`mb-3 ${s.text} font-bold uppercase tracking-[0.2em]`} style={{ color: c.accent, textShadow: `0 0 6px ${c.accent}88` }}>
            // Détail par jeu
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
                  className="p-4"
                  style={{ border: `1px solid ${c.primary}`, boxShadow: `0 0 10px -3px ${c.primary}` }}
                >
                  <h3 className="text-xl font-bold uppercase" style={{ color: c.primary, textShadow: glow }}>
                    {game?.name ?? entry.gameId}
                  </h3>
                  {game?.publisher && <div className="text-xs opacity-50">{game.publisher}</div>}
                  {entries.length > 0 && (
                    <dl className={`mt-3 grid grid-cols-2 ${s.gap} text-sm`}>
                      {entries.map(([key, val]) => (
                        <div key={key}>
                          <dt className="opacity-50">{resolveFieldLabel(key, fields)}</dt>
                          <dd style={{ color: c.accent }}>{formatValue(val)}</dd>
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
        <p className="py-12 text-center text-sm opacity-40">// Votre aperçu apparaîtra ici.</p>
      )}

      <AchievementsList achievements={achievements} t={sectionTheme} />
    </div>
  );
}
