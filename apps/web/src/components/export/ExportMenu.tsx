"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";

/**
 * ExportMenu — triggers PDF/PNG export via the headless-render API route and
 * downloads the resulting file. The render uses the SAME template as the live
 * preview (architecture §8: pixel-perfect WYSIWYG export).
 *
 * "pdf"/"png" run sequentially with per-button loading states; errors surface
 * inline. A profile with no games is still exportable (the summary/personal
 * info render), so we don't gate the buttons.
 */
export function ExportMenu() {
  const profile = useEditorStore((s) => s.profile);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function exportAs(format: "pdf" | "png") {
    setBusy(format);
    setError(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, format }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error ?? `Export échoué (HTTP ${res.status}).`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gamer-cv.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'export.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
        Exporter
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Rendu serveur haute fidélité : ce que tu vois est ce que tu exportes.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportAs("pdf")}
          disabled={busy !== null}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {busy === "pdf" ? "Génération…" : "PDF"}
        </button>
        <button
          type="button"
          onClick={() => exportAs("png")}
          disabled={busy !== null}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {busy === "png" ? "Génération…" : "Image (PNG)"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-800/50 bg-red-900/20 p-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
