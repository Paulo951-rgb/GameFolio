"use client";

import { useState } from "react";
import { Download, Image as ImageIcon, Check, FileText } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { Button, Card, Alert } from "@/components/ui";

/**
 * ExportMenu — triggers PDF/PNG export via the headless-render API route and
 * downloads the resulting file. The render uses the SAME template as the live
 * preview (architecture §8: pixel-perfect WYSIWYG export).
 *
 * After a successful export, shows a "Votre GameFolio est prêt" success state
 * with re-export + share affordances. "pdf"/"png" run sequentially with
 * per-button loading states; errors surface inline.
 */
export function ExportMenu() {
  const profile = useEditorStore((s) => s.profile);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"pdf" | "png" | null>(null);

  async function exportAs(format: "pdf" | "png") {
    setBusy(format);
    setError(null);
    setDone(null);
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
      a.download = `gamefolio.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDone(format);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'export.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card surface="2" className="p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
        Exporter
      </h2>
      <p className="mt-1 text-xs text-content-muted">
        Rendu serveur haute fidélité : ce que tu vois est ce que tu exportes.
      </p>

      {done ? (
        <div className="mt-4 rounded-lg border border-success/40 bg-success/10 p-4 text-center">
          <Check size={20} className="mx-auto text-success" aria-hidden />
          <p className="mt-1 text-sm font-medium text-success">
            Votre GameFolio est prêt
          </p>
          <p className="mt-1 text-xs text-content-muted">
            Le fichier {done.toUpperCase()} a été téléchargé.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="ghost" icon={FileText} onClick={() => void exportAs("pdf")}>
              Re-télécharger PDF
            </Button>
            <Button size="sm" variant="ghost" icon={ImageIcon} onClick={() => void exportAs("png")}>
              Exporter en image
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            icon={busy === "pdf" ? undefined : Download}
            loading={busy === "pdf"}
            onClick={() => void exportAs("pdf")}
            disabled={busy !== null}
          >
            Télécharger PDF
          </Button>
          <Button
            variant="secondary"
            icon={busy === "png" ? undefined : ImageIcon}
            loading={busy === "png"}
            onClick={() => void exportAs("png")}
            disabled={busy !== null}
          >
            Image (PNG)
          </Button>
        </div>
      )}

      {error && (
        <Alert
          tone="danger"
          title="Export impossible."
          recovery="Réessaie dans un instant ; si le problème persiste, vérifie ta connexion."
          className="mt-3"
        >
          {error}
        </Alert>
      )}
    </Card>
  );
}
