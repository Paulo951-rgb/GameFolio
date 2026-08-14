"use client";

import { useEditorStore } from "@/lib/store";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { AIGeneratePanel } from "@/components/ai/AIGeneratePanel";

export function PreviewStep() {
  const reset = useEditorStore((s) => s.reset);
  const games = useEditorStore((s) => s.profile.games);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Aperçu final</h2>
          <p className="mt-1 text-sm text-slate-400">
            Génère le texte de ton CV, ajuste-le, puis exporte-le (export en phase 3).
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

      <div className="lg:hidden">
        <LivePreviewPane />
      </div>
      <div className="hidden text-sm text-slate-500 lg:block">
        L’aperçu en direct reste disponible dans la colonne de droite.
      </div>
    </div>
  );
}
