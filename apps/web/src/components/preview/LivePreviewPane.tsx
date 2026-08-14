"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import { filterPersonalInfo, filterGameEntry } from "@gamer-cv/core";
import { MinimalistTemplate } from "./MinimalistTemplate";
import type { NormalizedCVData } from "@gamer-cv/types";

/**
 * LivePreviewPane — subscribes to the editor store, builds the normalized
 * (visibility-filtered) CV data, and renders the active template. The same
 * filtered view is what the export step will render headlessly, so what you
 * see is what you export.
 */
export function LivePreviewPane() {
  const profile = useEditorStore((s) => s.profile);

  const data = useMemo<NormalizedCVData>(() => {
    const personalInfo = filterPersonalInfo(profile.personalInfo);
    const games = profile.games
      .filter((g) => g.gameId !== "")
      .map((g) => filterGameEntry(g, profile.personalInfo.visibility))
      .filter((g): g is NonNullable<typeof g> => g !== null);
    return {
      personalInfo,
      playerTypes: profile.playerTypes,
      games,
      generated: profile.generatedText,
    };
  }, [profile]);

  return (
    <div className="h-full overflow-auto rounded-lg bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Aperçu en direct
        </h2>
      </div>
      <MinimalistTemplate data={data} theme={profile.themeConfig} />
    </div>
  );
}
