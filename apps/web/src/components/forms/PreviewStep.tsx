"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { AIGeneratePanel } from "@/components/ai/AIGeneratePanel";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ShareModal } from "@/components/share/ShareModal";
import { useSession } from "@/lib/useSession";

export function PreviewStep() {
  const reset = useEditorStore((s) => s.reset);
  const games = useEditorStore((s) => s.profile.games);
  const [shareOpen, setShareOpen] = useState(false);
  const { user } = useSession();

  async function saveToCloud() {
    const profile = useEditorStore.getState().profile;
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      alert("Profil sauvegardé dans le cloud. Retrouvez-le dans votre tableau de bord.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Aperçu final</h2>
          <p className="mt-1 text-sm text-slate-400">
            Génère le texte de ton CV, ajuste-le, puis exporte-le en PDF ou image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Recommencer un nouveau CV ? Cette action efface le profil local.")) {
              reset();
            }
          }}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400"
        >
          Réinitialiser
        </button>
      </div>

      {games.filter((g) => g.gameId).length === 0 && (
        <p className="rounded-md border border-amber-700/50 bg-amber-900/20 p-3 text-sm text-amber-200">
          Aucun jeu sélectionné. Revenez à l’étape « Jeux » pour en ajouter.
        </p>
      )}

      <AIGeneratePanel />
      <ExportMenu />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Partager
        </button>
        {user && (
          <button
            type="button"
            onClick={() => void saveToCloud()}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Sauvegarder dans le cloud
          </button>
        )}
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />

      <div className="lg:hidden">
        <LivePreviewPane />
      </div>
      <div className="hidden text-sm text-slate-500 lg:block">
        L’aperçu en direct reste disponible dans la colonne de droite.
      </div>
    </div>
  );
}
