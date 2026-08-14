"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { getGame } from "@/lib/games";

/**
 * AIGeneratePanel — triggers AI generation (and guided regeneration) of the CV
 * text, then displays the structured result. Hits server routes that run the
 * anti-hallucination pipeline; the server re-filters visibility before the
 * provider sees the data, so no client-side trust is needed.
 */
export function AIGeneratePanel() {
  const profile = useEditorStore((s) => s.profile);
  const flaggedFacts = useEditorStore((s) => s.flaggedFacts);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationError = useEditorStore((s) => s.generationError);
  const setGeneratedText = useEditorStore((s) => s.setGeneratedText);
  const setFlaggedFacts = useEditorStore((s) => s.setFlaggedFacts);
  const setGenerating = useEditorStore((s) => s.setGenerating);
  const setGenerationError = useEditorStore((s) => s.setGenerationError);

  const [instruction, setInstruction] = useState("");
  const [advanced, setAdvanced] = useState(false);

  const generated = profile.generatedText;

  async function runGeneration(instruction?: string) {
    setGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          instruction: instruction || "version initiale",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Échec de la génération.");
      }
      setGeneratedText(data.text);
      setFlaggedFacts(data.flaggedFacts ?? []);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setGenerating(false);
    }
  }

  const hasGames = profile.games.some((g) => g.gameId !== "");

  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Génération IA</h2>
        <p className="mt-1 text-sm text-slate-400">
          Génère un texte de CV structuré à partir de tes données. Le moteur
          n&apos;invente rien : seuls les champs renseignés sont utilisés.
        </p>
      </div>

      {!hasGames && (
        <p className="rounded-md border border-amber-700/40 bg-amber-900/20 p-3 text-sm text-amber-200">
          Ajoute au moins un jeu pour générer un texte pertinent.
        </p>
      )}

      {generationError && (
        <p className="rounded-md border border-red-700/40 bg-red-900/20 p-3 text-sm text-red-200">
          {generationError}
        </p>
      )}

      {flaggedFacts.length > 0 && (
        <p className="rounded-md border border-amber-700/40 bg-amber-900/20 p-3 text-sm text-amber-200">
          ⚠️ À vérifier : {flaggedFacts.join(", ")} (ces éléments n&apos;apparaissent
          pas dans tes données saisies).
        </p>
      )}

      <button
        type="button"
        disabled={!hasGames || isGenerating}
        onClick={() => runGeneration()}
        className="w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating
          ? "Génération…"
          : generated
            ? "Régénérer le texte"
            : "Générer mon texte de CV"}
      </button>

      {generated && (
        <div className="space-y-3 border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {advanced
                ? "Mode avancé : édition directe du texte généré."
                : "Texte généré par l'IA."}
            </span>
            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-700/40"
            >
              {advanced ? "Quitter le mode avancé" : "Mode avancé"}
            </button>
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Résumé
            </h3>
            {advanced ? (
              <textarea
                value={generated.summary}
                onChange={(e) =>
                  setGeneratedText({ ...generated, summary: e.target.value })
                }
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            ) : (
              <p className="mt-1 text-sm text-slate-100">{generated.summary}</p>
            )}
          </section>

          {generated.strengths.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Points forts
              </h3>
              {advanced ? (
                <textarea
                  value={generated.strengths.join("\n")}
                  onChange={(e) =>
                    setGeneratedText({
                      ...generated,
                      strengths: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  rows={Math.max(2, generated.strengths.length)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              ) : (
                <ul className="mt-1 list-inside list-disc text-sm text-slate-200">
                  {generated.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {Object.keys(generated.perGame).length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Par jeu
              </h3>
              <dl className="mt-1 space-y-2">
                {Object.entries(generated.perGame).map(([gameId, text]) => (
                  <div key={gameId}>
                    <dt className="text-sm font-medium text-violet-300">
                      {getGame(gameId)?.name ?? gameId}
                    </dt>
                    {advanced ? (
                      <textarea
                        value={text}
                        onChange={(e) =>
                          setGeneratedText({
                            ...generated,
                            perGame: { ...generated.perGame, [gameId]: e.target.value },
                          })
                        }
                        rows={3}
                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                    ) : (
                      <dd className="text-sm text-slate-200">{text}</dd>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="border-t border-slate-700 pt-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-400">
                Instruction de régénération
              </span>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="plus court, plus pro, sans mentionner mon âge…"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </label>
            <button
              type="button"
              disabled={!instruction.trim() || isGenerating}
              onClick={() => runGeneration(instruction.trim())}
              className="mt-2 w-full rounded-md border border-violet-500 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-600/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Régénérer avec l&apos;instruction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
