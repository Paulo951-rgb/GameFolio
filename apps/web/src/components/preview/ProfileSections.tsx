import type { Badge, Achievement } from "@gamer-cv/types";
import { getGame } from "@/lib/games";

/**
 * Shared, presentation-only sections for badges + achievements. Every template
 * renders these through the same components so the data looks consistent across
 * Minimalist/Gaming/Classique/Néon/Tech/Creator (WYSIWYG). They receive only
 * already-normalized data; they never fetch or compute.
 */

export interface SectionTheme {
  primary: string;
  text: string;
  /** heading utility classes, e.g. "mb-2 text-sm font-semibold uppercase tracking-wider" */
  headingClass: string;
  sectionClass: string;
}

/** Row of earned badges. Renders nothing when the list is empty. */
export function BadgesRow({
  badges,
  t,
}: {
  badges: Badge[];
  t: SectionTheme;
}) {
  if (badges.length === 0) return null;
  return (
    <section className={t.sectionClass}>
      <h2 className={t.headingClass} style={{ color: t.primary }}>
        Badges
      </h2>
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <span
            key={b.id}
            title={b.description}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${t.primary}1f`,
              color: t.primary,
              border: `1px solid ${t.primary}40`,
            }}
          >
            <span aria-hidden>{b.icon}</span>
            {b.name}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Achievements list (user-added). Renders nothing when the list is empty. */
export function AchievementsList({
  achievements,
  t,
}: {
  achievements: Achievement[];
  t: SectionTheme;
}) {
  if (achievements.length === 0) return null;
  return (
    <section className={t.sectionClass}>
      <h2 className={t.headingClass} style={{ color: t.primary }}>
        Achievements
      </h2>
      <ul className="space-y-2">
        {achievements.map((a) => {
          const game = a.gameId ? getGame(a.gameId) : null;
          return (
            <li
              key={a.id}
              className="rounded-md border p-3"
              style={{ borderColor: `${t.primary}33` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium" style={{ color: t.text }}>
                  {a.title}
                </span>
                {game && (
                  <span className="text-xs opacity-60">{game.name}</span>
                )}
              </div>
              {a.description && (
                <p className="mt-1 text-sm opacity-80">{a.description}</p>
              )}
              <div className="mt-1.5 flex items-center gap-3 text-xs opacity-60">
                {a.date && <span>📅 {a.date}</span>}
                {a.proofUrl && (
                  <a
                    href={a.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: t.primary }}
                  >
                    Preuve ↗
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Bio paragraph for the profile header. Renders nothing when no bio is set, so
 * templates that call it unconditionally stay clean.
 */
export function BioLine({ bio }: { bio?: string }) {
  if (!bio || bio.trim() === "") return null;
  return <p className="mt-2 text-sm leading-relaxed opacity-85">{bio}</p>;
}
