"use client";

import { useEffect, useMemo, useState } from "react";
import { GamerProfileSchema, type GamerProfile } from "@gamer-cv/types";
import { normalizeProfile } from "@/lib/normalize";
import { CVTemplate } from "@/components/preview/templates";
import { resolveTemplateBackground } from "@/components/preview/template-themes";
import { decodeProfileParam } from "./decode";

/**
 * Isolated export render page. Headless Chromium navigates here and captures
 * the SAME template component used by the live preview — so what the user saw
 * is exactly what gets exported (architecture §8).
 *
 * The profile travels base64url-encoded in the `?data=` query param (stateless:
 * no server-side profile storage for the MVP). This page runs with no app
 * chrome and sizes the CV to A4. Once the template mounts it sets
 * `data-cv-rendered="true"`, which the exporter waits for before capturing.
 *
 * The canvas background is resolved from the active template's default theme
 * (overridable by the user's themeConfig) so a dark CV never sits on a white
 * page — the export is edge-to-edge with a matching backdrop. Print CSS strips
 * the template's card chrome (rounded corners + drop shadow) for a clean PDF.
 */
export default function ExportRenderPage() {
  const [profile, setProfile] = useState<GamerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = new URLSearchParams(window.location.search).get("data");
    if (!data) {
      setError("Données de profil manquantes.");
      return;
    }
    const decoded = decodeProfileParam(data);
    if (!decoded.ok) {
      setError(decoded.error);
      return;
    }
    const parsed = GamerProfileSchema.safeParse(decoded.value);
    if (!parsed.success) {
      setError("Profil invalide.");
      return;
    }
    setProfile(parsed.data);
  }, []);

  const data = useMemo(
    () => (profile ? normalizeProfile(profile) : null),
    [profile],
  );

  const bg = profile ? resolveTemplateBackground(profile.themeConfig) : "#ffffff";

  return (
    <div
      className="cv-export-root flex items-start justify-center"
      data-cv-rendered={data ? "true" : undefined}
      style={
        { minHeight: "100vh", backgroundColor: bg, "--cv-bg": bg } as React.CSSProperties
      }
    >
      {error && (
        <p className="p-8 text-sm text-red-600" data-cv-error="true">
          {error}
        </p>
      )}
      {data && profile && (
        <div className="cv-export-canvas w-[210mm]">
          <CVTemplate data={data} theme={profile.themeConfig} />
        </div>
      )}
    </div>
  );
}
