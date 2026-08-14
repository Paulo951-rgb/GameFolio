"use client";

import { useEffect, useMemo, useState } from "react";
import { GamerProfileSchema, type GamerProfile } from "@gamer-cv/types";
import { normalizeProfile } from "@/lib/normalize";
import { CVTemplate } from "@/components/preview/templates";
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

  return (
    <div
      className="cv-export-root flex items-start justify-center bg-white"
      data-cv-rendered={data ? "true" : undefined}
      style={{ minHeight: "100vh" }}
    >
      {error && (
        <p className="p-8 text-sm text-red-600" data-cv-error="true">
          {error}
        </p>
      )}
      {data && profile && (
        <div className="w-[210mm] bg-white text-slate-900 shadow-none">
          <CVTemplate data={data} theme={profile.themeConfig} />
        </div>
      )}
    </div>
  );
}
