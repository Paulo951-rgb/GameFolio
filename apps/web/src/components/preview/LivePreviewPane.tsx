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
    <div className="h-full">
      <CVTemplate data={data} theme={profile.themeConfig} />
    </div>
  );
}
