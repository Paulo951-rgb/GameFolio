"use client";

import { useEditorStore } from "@/lib/store";

const PRESETS = [1, 2, 3, 4, 5, 6];

export function GameCountStep() {
  const games = useEditorStore((s) => s.profile.games);
  const setGameCount = useEditorStore((s) => s.setGameCount);
  const count = games.length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Combien de jeux présenter ?</h2>
        <p className="mt-1 text-sm text-slate-400">
          Vous pourrez ajouter ou retirer des jeux plus tard.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setGameCount(n)}
            className={`h-14 w-14 rounded-lg border text-lg font-semibold transition ${
              count === n
                ? "border-violet-500 bg-violet-600/20 text-violet-200"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        {count} emplacement{count > 1 ? "s" : ""} sélectionné{count > 1 ? "s" : ""}.
      </p>
    </div>
  );
}
