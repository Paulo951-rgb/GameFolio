"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import { normalizeProfile } from "@/lib/normalize";
import { CVTemplate } from "./templates";

/**
 * LivePreviewPane — subscribes to the editor store, builds the normalized
 * (visibility-filtered) CV data, and renders the active template via the
 * shared CVTemplate resolver. The same resolver + filtered view is what the
 * export step renders headlessly, so what you see is what you export — for
 * every template, not just the default.
 */
export function LivePreviewPane() {
  const profile = useEditorStore((s) => s.profile);

  const data = useMemo(() => normalizeProfile(profile), [profile]);

  return (
    <div className="h-full overflow-auto rounded-lg bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Aperçu en direct
        </h2>
      </div>
      <CVTemplate data={data} theme={profile.themeConfig} />
    </div>
  );
}
