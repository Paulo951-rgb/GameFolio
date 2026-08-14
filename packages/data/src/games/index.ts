import type { GameDefinition, GameRegistry } from "@gamer-cv/types";
import { Valorant } from "./valorant.js";
import { Minecraft } from "./minecraft.js";
import { Hades } from "./hades.js";
import { ClashOfClans } from "./clash-of-clans.js";
import { moduleRegistry } from "../modules/index.js";
import { resolveGame } from "@gamer-cv/core";

/**
 * Game registry — the canonical catalogue of games (4 test games for Phase 0).
 * Adding a game = new file + one line in the `games` array. A game = a PR,
 * not a UI component (architecture doc section 5).
 *
 * `buildGameRegistry` validates at module-load time that every game's modules
 * resolve against the module registry, so a misconfigured game fails loudly at
 * startup rather than at user runtime.
 */
export const games: GameDefinition[] = [Valorant, Minecraft, Hades, ClashOfClans];

export function buildGameRegistry(): GameRegistry {
  const map = new Map<string, GameDefinition>();
  for (const g of games) {
    // Eager validation: ensures composite schema builds (no unknown modules,
    // no ambiguous overlapping field keys across composed modules).
    resolveGame(g, moduleRegistry);
    if (map.has(g.id)) {
      throw new Error(`Duplicate game id "${g.id}" in registry`);
    }
    map.set(g.id, g);
  }
  return map;
}

export const gameRegistry = buildGameRegistry();

/**
 * Autocomplete search over the catalogue (for the GameSearchCombobox).
 * Matches on name or genre; case-insensitive; simple for the MVP.
 */
export function searchGames(query: string, limit = 10): GameDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return games.slice(0, limit);
  return games
    .filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.genres.some((genre) => genre.toLowerCase().includes(q)),
    )
    .slice(0, limit);
}
