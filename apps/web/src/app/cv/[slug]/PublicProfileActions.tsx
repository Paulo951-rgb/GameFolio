"use client";

import { useState } from "react";
import { Link2, Download, Image as ImageIcon, Check, Share2 } from "lucide-react";
import type { GamerProfile } from "@gamer-cv/types";
import { Button, IconButton } from "@/components/ui";

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
  const [exportFormat, setExportFormat] = useState<"pdf" | "png" | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setExportFormat(format);
    setError(null);
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
    } catch {
      setError("Export impossible. Réessaie dans un instant.");
    } finally {
      setExportFormat(null);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile.personalInfo.gamerTag} — GameFolio`, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      void copyLink();
    }
  }

  const busy = exportFormat !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton
        icon={copied ? Check : Link2}
        label={copied ? "Lien copié" : "Copier le lien"}
        variant="ghost"
        size="sm"
        onClick={() => void copyLink()}
        className={copied ? "!text-success" : ""}
      />
      <Button
        size="sm"
        icon={busy && exportFormat === "pdf" ? undefined : Download}
        loading={busy && exportFormat === "pdf"}
        onClick={() => void doExport("pdf")}
        disabled={busy}
      >
        <span className="hidden sm:inline">PDF</span>
      </Button>
      <Button
        size="sm"
        variant="secondary"
        icon={busy && exportFormat === "png" ? undefined : ImageIcon}
        loading={busy && exportFormat === "png"}
        onClick={() => void doExport("png")}
        disabled={busy}
      >
        <span className="hidden sm:inline">PNG</span>
      </Button>
      <IconButton icon={Share2} label="Partager" variant="ghost" size="sm" onClick={() => void nativeShare()} />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
