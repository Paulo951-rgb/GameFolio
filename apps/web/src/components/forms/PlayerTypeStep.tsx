"use client";

import { useEditorStore } from "@/lib/store";
import { PlayerTypeSelector } from "./PlayerTypeSelector";

export function PlayerTypeStep() {
  const playerTypes = useEditorStore((s) => s.profile.playerTypes);
  const setPlayerTypes = useEditorStore((s) => s.setPlayerTypes);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Type de joueur</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sélectionnez un ou plusieurs profils qui vous correspondent.
        </p>
      </div>
      <PlayerTypeSelector selected={playerTypes} onChange={setPlayerTypes} />
    </div>
  );
}
