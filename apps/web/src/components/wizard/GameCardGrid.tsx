"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameDefinition } from "@gamer-cv/types";
import { gameSearchResults } from "@/lib/games";
import { TextInput, Badge } from "@/components/ui";

/**
 * GameCardGrid — modern game picker. Renders the catalogue as cards with name,
 * genres, platform + release year, instant search, and a category filter
 * derived from the genres present in the catalogue. Multi-select with a clear
 * "selected" state. Performance: the catalogue is large but we cap the rendered
 * list (virtualization isn't needed at this scale — we just slice the search
 * result) and memoize the filter.
 *
 * Pure presentation + selection: it calls `onToggle(game)` for each click; the
 * parent owns the selected set.
 */

/** Top distinct genres across the catalogue, sorted by frequency (capped so the
 *  filter rail stays scannable — we only surface the most common genres). */
function buildCategories(): string[] {
  const counts = new Map<string, number>();
  for (const g of gameSearchResults("", 9999)) {
    for (const genre of g.genres ?? []) {
      const k = genre.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((e) => e[0]);
  return ["tous", ...top];
}

export interface GameCardGridProps {
  selectedIds: string[];
  onToggle: (game: GameDefinition) => void;
  /** Exclude ids (already-selected games not yet committed, etc.). Optional. */
  excludeIds?: string[];
  pageSize?: number;
}

export function GameCardGrid({
  selectedIds,
  onToggle,
  excludeIds = [],
  pageSize = 24,
}: GameCardGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("tous");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const categories = useMemo(buildCategories, []);
  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds]);

  const results = useMemo(() => {
    const hits = gameSearchResults(query, 9999).filter((g) => !excludeSet.has(g.id));
    if (category === "tous") return hits;
    return hits.filter((g) => g.genres?.some((x) => x.toLowerCase() === category));
  }, [query, category, excludeSet]);

  const visible = results.slice(0, visibleCount);

  // Reset the visible window whenever the query/category changes.
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [query, category, pageSize]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <TextInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un jeu… (Valorant, Minecraft, RL…)"
            aria-label="Rechercher un jeu"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
              category === cat
                ? "bg-accent/20 text-accent"
                : "text-content-muted hover:text-content-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-content-muted">
          Aucun jeu ne correspond à « {query} ».
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((g) => {
            const selected = selectedSet.has(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onToggle(g)}
                aria-pressed={selected}
                className={`group relative flex h-full flex-col rounded-lg border p-4 text-left transition ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-line surface hover:-translate-y-0.5 hover:border-line-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-content-primary">{g.name}</h3>
                  {selected && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-xs text-bg">
                      ✓
                    </span>
                  )}
                </div>
                {g.genres?.length ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {g.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} tone="accent">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-auto pt-3 text-xs text-content-muted">
                  {[g.publisher, g.platforms?.join(", "), g.releaseYear]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {visibleCount < results.length && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="btn btn-ghost px-4 py-2 text-sm"
          >
            Afficher plus ({results.length - visibleCount} restants)
          </button>
        </div>
      )}
    </div>
  );
}
