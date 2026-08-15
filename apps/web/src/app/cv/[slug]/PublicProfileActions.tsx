"use client";

import { useState } from "react";
import type { GamerProfile } from "@gamer-cv/types";
import { Button } from "@/components/ui";

/**
 * PublicProfileActions — client-side actions on a public profile page: copy the
 * share link + trigger a PDF/PNG export through the same /api/export route the
 * editor uses. The profile (already visibility-filtered server-side) is sent as
 * the export payload. No edit affordances — this is a read-only view.
 */
export function PublicProfileActions({
  slug,
  profile,
}: {
  slug: string;
  profile: GamerProfile;
}) {
  const [copied, setCopied] = useState(false);
  const [exportState, setExportState] = useState<"idle" | "busy" | "error">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (insecure context); ignore silently.
    }
  }

  async function doExport(format: "pdf" | "png") {
    setExportState("busy");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, format }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gamefolio-${slug}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" onClick={() => void copyLink()}>
        {copied ? "✓ Lien copié" : "Copier le lien"}
      </Button>
      <Button size="sm" onClick={() => void doExport("pdf")} disabled={exportState === "busy"}>
        {exportState === "busy" ? "Génération…" : "Télécharger PDF"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => void doExport("png")} disabled={exportState === "busy"}>
        Image PNG
      </Button>
      {exportState === "error" && (
        <span className="text-xs text-danger">Échec de l'export.</span>
      )}
    </div>
  );
}
