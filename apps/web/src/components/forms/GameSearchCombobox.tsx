"use client";

import { useMemo, useRef, useState } from "react";
import { searchGames } from "@/lib/games";
import type { GameDefinition } from "@gamer-cv/types";

/**
 * GameSearchCombobox — autocomplete over the game catalog. The catalog is a
 * static registry (packages/data) so search happens entirely client-side.
 */
interface GameSearchComboboxProps {
  onSelect: (game: GameDefinition) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function GameSearchCombobox({
  onSelect,
  excludeIds = [],
  placeholder = "Rechercher un jeu…",
}: GameSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchGames(query).filter((g) => !excludeIds.includes(g.id)).slice(0, 8);
  }, [query, excludeIds]);

  function choose(game: GameDefinition) {
    onSelect(game);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && results[highlight]) {
            e.preventDefault();
            choose(results[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-700 bg-slate-900 shadow-lg">
          {results.map((game, i) => (
            <li key={game.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(game)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  i === highlight ? "bg-violet-600/30" : "hover:bg-slate-800"
                }`}
              >
                <span className="font-medium">{game.name}</span>
                <span className="text-xs text-slate-500">
                  {game.genres.join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-500 shadow-lg">
          Aucun jeu trouvé pour «&nbsp;{query}&nbsp;»
        </div>
      )}
    </div>
  );
}
