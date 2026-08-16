import type { NormalizedCVData, ProfileStats } from "@gamer-cv/types";
import type { LucideIcon } from "lucide-react";
import { MapPin, Languages, Gamepad2, Trophy, Clock, Layers } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

/**
 * PublicProfileHero — premium portfolio header for the public /cv/[slug] page
 * (§11). Rendered server-side from visibility-filtered data (normalizeProfile
 * already stripped hidden/private fields), so this component only ever sees
 * what's public. It shows identity + global stats as a strong intro BEFORE the
 * CV template, giving the page a distinct portfolio identity (not a dashboard).
 *
 * `stats` are computed by the page via computeProfileStats (the registry is
 * server-available) and passed in — NormalizedCVData doesn't carry them.
 *
 * This is a server component (no "use client"): lucide icons render fine
 * server-side, and Avatar uses no client hooks. The action bar (share/QR/export)
 * is a separate client island in the page so this hero stays static-cheap.
 */
export function PublicProfileHero({
  data,
  stats,
}: {
  data: NormalizedCVData;
  stats: ProfileStats;
}) {
  const info = data.personalInfo;
  const platforms = info.platforms ?? [];

  return (
    <section className="relative overflow-hidden border-b border-line bg-base">
      {/* subtle accent top band — single restrained gradient, not RGB glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" aria-hidden />
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* Identity */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar
              url={info.avatarUrl}
              gamerTag={info.gamerTag}
              size="xl"
              className="ring-2 ring-line shadow-[0_12px_40px_-12px_var(--accent-glow)]"
            />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-content-primary sm:text-4xl">
                {info.gamerTag}
              </h1>
              {info.firstName && (
                <p className="mt-1 text-sm text-content-secondary">{info.firstName}</p>
              )}
              {info.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-content-secondary">
                  {info.bio}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-content-muted">
                {info.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} aria-hidden /> {info.country}
                  </span>
                )}
                {(info.languages?.length ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Languages size={13} aria-hidden /> {info.languages!.join(", ")}
                  </span>
                )}
                {platforms.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Gamepad2 size={13} aria-hidden /> {platforms.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Global stats tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat icon={Gamepad2} label="Jeux" value={stats.totalGames} />
            <HeroStat
              icon={Clock}
              label="Heures"
              value={stats.totalHours ? formatHours(stats.totalHours) : "—"}
            />
            <HeroStat icon={Trophy} label="Badges" value={data.badges.length} />
            <HeroStat
              icon={Layers}
              label="Achievements"
              value={(data.achievements ?? []).length}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="surface-2 min-w-[88px] rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-content-muted">
        <Icon size={12} aria-hidden />
        {label}
      </div>
      <div className="mt-0.5 text-xl font-bold text-content-primary">{value}</div>
    </div>
  );
}

function formatHours(h: number): string {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}k`;
  return h % 1 === 0 ? `${h}h` : `${Math.round(h)}h`;
}
