"use client";

import { ChevronUp, ChevronDown, X, Gamepad2 } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { GameCardGrid } from "@/components/wizard/GameCardGrid";
import { DynamicGameForm } from "./DynamicGameForm";
import { getResolvedGame, getGame } from "@/lib/games";
import type { GameDefinition } from "@gamer-cv/types";
import { Field, Textarea, Badge, IconButton, EmptyState } from "@/components/ui";

/**
 * GameEntryStep — modern game selection + per-game stats form.
 *
 * Selection is now card-based (GameCardGrid): the user toggles games in/out
 * directly, which adds/removes an entry in the store. Each selected game then
 * renders its dynamic form (driven by the module schema — no per-game UI code)
 * + free text. Order is adjusted via up/down controls.
 */
export function GameEntryStep() {
  const games = useEditorStore((s) => s.profile.games);
  const addGame = useEditorStore((s) => s.addGame);
  const updateGame = useEditorStore((s) => s.updateGame);
  const removeGame = useEditorStore((s) => s.removeGame);
  const reorderGames = useEditorStore((s) => s.reorderGames);

  const selectedIds = games.map((g) => g.gameId).filter(Boolean);

  function toggle(g: GameDefinition) {
    const existingIdx = games.findIndex((e) => e.gameId === g.id);
    if (existingIdx >= 0) {
      removeGame(existingIdx);
    } else {
      addGame({ gameId: g.id, moduleData: {}, order: games.length });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-content-primary">Tes jeux</h2>
        <p className="mt-1 text-sm text-content-muted">
          Sélectionne tes jeux, puis remplis les statistiques générées automatiquement pour chacun.
        </p>
      </div>

      <GameCardGrid selectedIds={selectedIds} onToggle={toggle} />

      {games.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
            Statistiques par jeu ({games.length})
          </h3>
          {games.map((entry, index) => {
            const resolved = entry.gameId ? getResolvedGame(entry.gameId) : null;
            const game = entry.gameId ? getGame(entry.gameId) : undefined;

            return (
              <div key={entry.gameId || `empty-${index}`} className="surface p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-content-muted">#{index + 1}</span>
                    {game && (
                      <h4 className="font-semibold text-content-primary">{game.name}</h4>
                    )}
                    {game?.genres?.slice(0, 2).map((gg) => (
                      <Badge key={gg} tone="accent">
                        {gg}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton
                      icon={ChevronUp}
                      label="Monter"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => reorderGames(index, index - 1)}
                    />
                    <IconButton
                      icon={ChevronDown}
                      label="Descendre"
                      size="sm"
                      disabled={index === games.length - 1}
                      onClick={() => reorderGames(index, index + 1)}
                    />
                    <IconButton
                      icon={X}
                      label={`Retirer ${game?.name ?? "ce jeu"}`}
                      size="sm"
                      variant="ghost"
                      className="!text-danger hover:!bg-danger/10"
                      onClick={() => removeGame(index)}
                    />
                  </div>
                </div>

                {resolved && game && (
                  <>
                    <DynamicGameForm
                      game={game}
                      fields={resolved.fields}
                      compositeSchema={resolved.compositeSchema}
                      values={entry.moduleData}
                      onChange={(data) => updateGame(index, { moduleData: data })}
                    />
                    <Field
                      label="Texte libre (anecdotes, contexte, équipe…)"
                      htmlFor={`freetext-${index}`}
                      className="mt-4"
                    >
                      <Textarea
                        id={`freetext-${index}`}
                        value={entry.freeText ?? ""}
                        onChange={(e) => updateGame(index, { freeText: e.target.value })}
                        rows={2}
                        placeholder="Optionnel"
                      />
                    </Field>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {games.length === 0 && (
        <EmptyState
          icon={Gamepad2}
          title="Aucun jeu sélectionné"
          description="Choisis-en au moins un dans la grille ci-dessus pour remplir tes statistiques."
        />
      )}
    </div>
  );
}
