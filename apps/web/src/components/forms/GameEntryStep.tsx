"use client";

import { useEditorStore } from "@/lib/store";
import { GameSearchCombobox } from "./GameSearchCombobox";
import { DynamicGameForm } from "./DynamicGameForm";
import { getResolvedGame, getGame } from "@/lib/games";
import type { GameDefinition } from "@gamer-cv/types";

export function GameEntryStep() {
  const games = useEditorStore((s) => s.profile.games);
  const updateGame = useEditorStore((s) => s.updateGame);
  const removeGame = useEditorStore((s) => s.removeGame);
  const reorderGames = useEditorStore((s) => s.reorderGames);

  const selectedIds = games.map((g) => g.gameId).filter(Boolean);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Vos jeux</h2>
        <p className="mt-1 text-sm text-slate-400">
          Recherchez et sélectionnez chaque jeu, puis remplissez le formulaire généré.
        </p>
      </div>

      {games.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
          Aucun emplacement. Revenez à l’étape précédente pour en ajouter.
        </p>
      )}

      {games.map((entry, index) => {
        const resolved = entry.gameId ? getResolvedGame(entry.gameId) : null;
        const game = entry.gameId ? getGame(entry.gameId) : undefined;

        return (
          <div
            key={index}
            className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">
                Jeu #{index + 1}
                {game && <span className="ml-2 text-violet-300">{game.name}</span>}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Monter"
                  disabled={index === 0}
                  onClick={() => reorderGames(index, index - 1)}
                  className="rounded px-2 py-1 text-xs text-slate-400 transition hover:text-slate-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Descendre"
                  disabled={index === games.length - 1}
                  onClick={() => reorderGames(index, index + 1)}
                  className="rounded px-2 py-1 text-xs text-slate-400 transition hover:text-slate-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeGame(index)}
                  className="ml-2 text-xs text-slate-500 hover:text-red-400"
                >
                  Retirer
                </button>
              </div>
            </div>

            {!entry.gameId ? (
              <GameSearchCombobox
                excludeIds={selectedIds}
                onSelect={(g: GameDefinition) =>
                  updateGame(index, { gameId: g.id })
                }
              />
            ) : (
              resolved &&
              game && (
                <>
                  <DynamicGameForm
                    game={game}
                    fields={resolved.fields}
                    compositeSchema={resolved.compositeSchema}
                    values={entry.moduleData}
                    onChange={(data) => updateGame(index, { moduleData: data })}
                  />
                  <label className="mt-4 block">
                    <span className="block text-sm font-medium text-slate-300">
                      Texte libre (anecdotes, contexte, équipe…)
                    </span>
                    <textarea
                      value={entry.freeText ?? ""}
                      onChange={(e) =>
                        updateGame(index, { freeText: e.target.value })
                      }
                      rows={2}
                      placeholder="Optionnel"
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </label>
                </>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
