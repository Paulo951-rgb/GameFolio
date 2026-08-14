"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { StatsPanel } from "@/components/preview/StatsPanel";
import { AIGeneratePanel } from "@/components/ai/AIGeneratePanel";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ShareModal } from "@/components/share/ShareModal";
import { useSession } from "@/lib/useSession";

export function PreviewStep() {
  const reset = useEditorStore((s) => s.reset);
  const games = useEditorStore((s) => s.profile.games);
  const setCloudProfileId = useEditorStore((s) => s.setCloudProfileId);
  const cloudProfileId = useEditorStore((s) => s.cloudProfileId);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveState, setSaveState] = useState<{ busy: boolean; msg: string | null }>({
    busy: false,
    msg: null,
  });
  const { user } = useSession();

  async function saveToCloud() {
    setSaveState({ busy: true, msg: null });
    try {
      const profile = useEditorStore.getState().profile;
      const id = useEditorStore.getState().cloudProfileId;
      // PATCH the existing cloud row when we already have its id; POST (create)
      // only the first time. This prevents duplicate cloud profiles on repeated
      // saves (each save used to create a new row).
      const res = await fetch(
        id ? `/api/profiles/${id}` : "/api/profiles",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      if (!id) {
        const created = (await res.json()) as { id: string };
        setCloudProfileId(created.id);
      }
      setSaveState({ busy: false, msg: "Profil sauvegardé dans le cloud." });
    } catch (err) {
      setSaveState({
        busy: false,
        msg: err instanceof Error ? `Échec : ${err.message}` : "Échec de la sauvegarde.",
      });
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
      <StatsPanel />
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
            disabled={saveState.busy}
            onClick={() => void saveToCloud()}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            {saveState.busy ? "Sauvegarde…" : cloudProfileId ? "Mettre à jour le cloud" : "Sauvegarder dans le cloud"}
          </button>
        )}
      </div>

      {saveState.msg && (
        <p
          className={`text-sm ${
            saveState.msg.startsWith("Échec") ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {saveState.msg}
        </p>
      )}

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
