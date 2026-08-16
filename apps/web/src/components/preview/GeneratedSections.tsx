"use client";

import type { CSSProperties, ReactNode } from "react";
import type { GeneratedText } from "@gamer-cv/types";
import { getGame } from "@/lib/games";

/**
 * Shared rendering of the AI-generated CV sections (§14). Used by every
 * template so the generated content is presented consistently and the
 * WYSIWYG contract (preview === export) holds across templates.
 *
 * Renders the V2 analysis-driven sections when present (profileSummary,
 * gamingIdentity, strengths, experience, specializations, performance, games[])
 * and falls back to the legacy summary/strengths/perGame fields so profiles
 * generated before V2 still render.
 *
 * Pure presentation: styles are derived from the resolved theme colors passed
 * in by each template (so a template keeps its visual identity).
 */
export interface GeneratedSectionTheme {
  primary: string;
  text: string;
  headingClass: string;
  bodyClass: string;
  sectionClass: string;
  /** Optional prefix prepended to each section heading (template flair, e.g. "▸ "). */
  headingPrefix?: string;
  /** Optional extra inline style for headings (e.g. neon text-shadow). */
  headingStyle?: CSSProperties;
}

export function GeneratedSections({
  generated,
  t,
}: {
  generated?: GeneratedText;
  t: GeneratedSectionTheme;
}) {
  if (!generated) return null;

  const prefix = t.headingPrefix ?? "";
  const heading = (label: string) => (
    <h2 className={t.headingClass} style={{ color: t.primary, ...t.headingStyle }}>
      {prefix}{label}
    </h2>
  );

  const summary = generated.profileSummary ?? generated.summary;
  const games = generated.games ?? [];
  const hasLegacyPerGame = Object.keys(generated.perGame ?? {}).length > 0;

  const nothingToShow =
    !summary &&
    !generated.gamingIdentity &&
    !generated.experience &&
    !generated.performance &&
    (generated.strengths?.length ?? 0) === 0 &&
    (generated.specializations?.length ?? 0) === 0 &&
    games.length === 0 &&
    !hasLegacyPerGame;

  if (nothingToShow) return null;

  const block = (label: string, children: ReactNode) => (
    <section className={t.sectionClass}>
      {heading(label)}
      {children}
    </section>
  );

  return (
    <>
      {summary && block("Présentation", <p className={t.bodyClass}>{summary}</p>)}

      {generated.gamingIdentity &&
        block("Profil gaming", <p className={t.bodyClass}>{generated.gamingIdentity}</p>)}

      {(generated.strengths?.length ?? 0) > 0 &&
        block(
          "Points forts",
          <ul className={`${t.bodyClass} list-inside list-disc`}>
            {generated.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>,
        )}

      {generated.experience &&
        block("Expérience", <p className={t.bodyClass}>{generated.experience}</p>)}

      {(generated.specializations?.length ?? 0) > 0 &&
        block(
          "Spécialisations",
          <ul className={`${t.bodyClass} list-inside list-disc`}>
            {generated.specializations.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>,
        )}

      {generated.performance &&
        block("Performances", <p className={t.bodyClass}>{generated.performance}</p>)}

      {games.length > 0
        ? block(
            "Jeux",
            <dl className="space-y-3">
              {games.map((g) => (
                <div key={g.gameId}>
                  <dt className="font-semibold" style={{ color: t.primary }}>
                    {g.title ?? getGame(g.gameId)?.name ?? g.gameId}
                  </dt>
                  <dd className={t.bodyClass}>{g.description}</dd>
                  {(g.highlights?.length ?? 0) > 0 && (
                    <ul className="mt-1 list-inside list-disc text-xs opacity-75">
                      {g.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </dl>,
          )
        : hasLegacyPerGame &&
          block(
            "Par jeu",
            <dl className="space-y-2">
              {Object.entries(generated.perGame).map(([gameId, text]) => (
                <div key={gameId}>
                  <dt className="font-semibold" style={{ color: t.primary }}>
                    {getGame(gameId)?.name ?? gameId}
                  </dt>
                  <dd className={t.bodyClass}>{text}</dd>
                </div>
              ))}
            </dl>,
          )}
    </>
  );
}
