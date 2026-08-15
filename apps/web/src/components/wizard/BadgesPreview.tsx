"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import { allBadges, computeBadges } from "@gamer-cv/core";
import { gameRegistry } from "@gamer-cv/data";
import type { Badge as BadgeT } from "@gamer-cv/types";
import { Card } from "@/components/ui";

/**
 * BadgesPreview — shows the badges the profile has EARNED (computed live from
 * the real data only, never fabricated) plus the remaining locked ones with the
 * condition to unlock them. Read-only; it reflects the current profile state.
 * Lives in the wizard (customization/preview area) so the user sees the effect
 * of adding hours/ranks/achievements in real time.
 */
export function BadgesPreview() {
  const profile = useEditorStore((s) => s.profile);

  const { earned, locked } = useMemo(() => {
    const earnedIds = new Set(computeBadges(profile, gameRegistry).map((b) => b.id));
    const catalogue = allBadges();
    return {
      earned: catalogue.filter((b) => earnedIds.has(b.id)),
      locked: catalogue.filter((b) => !earnedIds.has(b.id)),
    };
  }, [profile]);

  return (
    <Card surface="2" className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
          Badges
        </h3>
        <span className="text-xs text-content-muted">
          {earned.length} / {earned.length + locked.length} débloqués
        </span>
      </div>

      {earned.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {earned.map((b) => (
            <BadgeChip key={b.id} badge={b} earned />
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <div className="mb-2 text-xs text-content-muted">À débloquer</div>
          <div className="flex flex-wrap gap-2">
            {locked.map((b) => (
              <BadgeChip key={b.id} badge={b} earned={false} />
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function BadgeChip({ badge, earned }: { badge: BadgeT; earned: boolean }) {
  return (
    <span
      title={badge.description}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
        earned
          ? "border border-accent/40 bg-accent/10 text-accent"
          : "border border-line text-content-muted opacity-60"
      }`}
    >
      <span aria-hidden className={earned ? "" : "grayscale"}>
        {badge.icon}
      </span>
      {badge.name}
    </span>
  );
}
