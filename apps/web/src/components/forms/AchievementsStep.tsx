"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { getGame } from "@/lib/games";
import type { Achievement } from "@gamer-cv/types";
import { Field, Fieldset, TextInput, Textarea, Select, Button, Card, Badge } from "@/components/ui";
import { gameSearchResults } from "@/lib/games";

/**
 * AchievementsStep — profile-level achievements the user adds manually. Each
 * achievement links to a game (optional), carries a date + description + an
 * optional proof URL. Stored on the profile, persisted to cloud, rendered by
 * every template through the shared AchievementsList. No values are fabricated.
 */
export function AchievementsStep() {
  const profile = useEditorStore((s) => s.profile);
  const addAchievement = useEditorStore((s) => s.addAchievement);
  const removeAchievement = useEditorStore((s) => s.removeAchievement);
  const achievements = profile.achievements ?? [];

  const [draft, setDraft] = useState<Partial<Achievement>>({ gameId: "" });
  const [query, setQuery] = useState("");

  // Resolve the games already in the profile + any search hit so the user can
  // link an achievement to a game they haven't added yet.
  const profileGames = profile.games
    .map((g) => getGame(g.gameId))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const searchHits = query.trim() ? gameSearchResults(query).slice(0, 8) : [];
  const linkableGames = [
    ...profileGames,
    ...searchHits.filter((g) => !profileGames.some((p) => p.id === g.id)),
  ];

  function commit() {
    if (!draft.title?.trim()) return;
    addAchievement({
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
      gameId: draft.gameId || undefined,
      date: draft.date?.trim() || undefined,
      proofUrl: draft.proofUrl?.trim() || undefined,
    });
    setDraft({ gameId: "" });
  }

  return (
    <Fieldset>
      <h2 className="text-lg font-semibold text-content-primary">Achievements</h2>
      <p className="-mt-2 text-sm text-content-muted">
        Tes moments marquants. Chaque achievement est lié à un jeu et peut porter une date + une
        preuve (lien).
      </p>

      {/* Add form */}
      <Card surface="2" className="space-y-3 p-4">
        <Field label="Titre *" htmlFor="ach-title">
          <TextInput
            id="ach-title"
            value={draft.title ?? ""}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Diamond atteint / Ender Dragon vaincu / Tournoi gagné"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jeu" htmlFor="ach-game">
            <Select
              id="ach-game"
              value={draft.gameId ?? ""}
              onChange={(e) => setDraft({ ...draft, gameId: e.target.value })}
            >
              <option value="">— Aucun / global —</option>
              {linkableGames.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" htmlFor="ach-date">
            <TextInput
              id="ach-date"
              type="month"
              value={draft.date ?? ""}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
        </div>
        {/* Search to surface games not already in the profile */}
        <Field label="Rechercher un jeu à lier" htmlFor="ach-search">
          <TextInput
            id="ach-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Commence à taper…"
          />
        </Field>
        <Field label="Description" htmlFor="ach-desc">
          <Textarea
            id="ach-desc"
            rows={2}
            value={draft.description ?? ""}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Contexte, circonstances…"
          />
        </Field>
        <Field label="Lien de preuve (optionnel)" htmlFor="ach-proof">
          <TextInput
            id="ach-proof"
            type="url"
            value={draft.proofUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, proofUrl: e.target.value })}
            placeholder="https://…"
          />
        </Field>
        <div className="flex justify-end">
          <Button size="sm" onClick={commit} disabled={!draft.title?.trim()}>
            + Ajouter l'achievement
          </Button>
        </div>
      </Card>

      {/* List */}
      {achievements.length === 0 ? (
        <p className="py-6 text-center text-sm text-content-muted">
          Aucun achievement pour l'instant. Ajoute tes moments marquants ci-dessus.
        </p>
      ) : (
        <ul className="space-y-2">
          {achievements.map((a) => {
            const game = a.gameId ? getGame(a.gameId) : null;
            return (
              <li key={a.id} className="surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-content-primary">{a.title}</span>
                      {game && <Badge tone="accent">{game.name}</Badge>}
                      {a.date && <span className="text-xs text-content-muted">{a.date}</span>}
                    </div>
                    {a.description && (
                      <p className="mt-1 text-sm text-content-secondary">{a.description}</p>
                    )}
                    {a.proofUrl && (
                      <a
                        href={a.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-accent underline"
                      >
                        Preuve ↗
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(a.id)}
                    aria-label={`Supprimer ${a.title}`}
                  >
                    ✕
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Fieldset>
  );
}
