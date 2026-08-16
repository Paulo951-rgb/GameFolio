import {
  gameRegistry,
  moduleRegistry,
  searchGames,
} from "@gamer-cv/data";
import { resolveGame } from "@gamer-cv/core";
import type { FieldDescriptor, GameDefinition } from "@gamer-cv/types";

export { gameRegistry, moduleRegistry, searchGames };

export function getGame(id: string): GameDefinition | undefined {
  return gameRegistry.get(id);
}

/** All games in the static catalogue (a stable array, read-only consumers). */
export function allGames(): GameDefinition[] {
  return Array.from(gameRegistry.values());
}

/**
 * Client-side search convenience wrapper over the data package's searchGames:
 * runs the full exact→starts→includes→genre→platform→fuzzy pipeline over the
 * whole catalogue and returns up to `limit` matches. Used by the game picker
 * + the achievements "link a game" combobox so the UI never loads the full
 * catalogue up front when a query is present.
 */
export function gameSearchResults(query: string, limit = 20): GameDefinition[] {
  if (!query.trim()) return allGames().slice(0, limit);
  return searchGames(query.trim(), limit);
}

export function getResolvedGame(id: string) {
  const game = gameRegistry.get(id);
  if (!game) return null;
  return resolveGame(game, moduleRegistry);
}

/**
 * Resolve a field's concrete options from a game's gameData, e.g.
 * optionsSource "game.ranks" -> game.gameData.ranks. Returns undefined when the
 * source is missing OR empty — the form then renders a free-text fallback so a
 * game whose gameData lacks a given list never shows a dead/empty dropdown.
 */
export function resolveFieldOptions(
  game: GameDefinition,
  field: FieldDescriptor,
): string[] | undefined {
  if (field.options) return field.options;
  if (!field.optionsSource) return undefined;
  const key = field.optionsSource.replace(/^game\./, "");
  const value = game.gameData[key];
  return Array.isArray(value) && value.length > 0 ? (value as string[]) : undefined;
}

// Player-type taxonomy for the selector step (Bartle-inspired, gamer-facing).
export const PLAYER_TYPES = [
  { id: "competiteur", label: "Compétiteur", description: "Esprit de compétition, ranked, esport" },
  { id: "explorateur", label: "Explorateur", description: "Découverte, open-world, secrets" },
  { id: "social", label: "Social", description: "Multiplayer, coop, communauté" },
  { id: "acheveur", label: "Acheveur", description: "100%, trophées, complétion" },
  { id: "creatif", label: "Créatif", description: "Sandbox, building, modding" },
  { id: "narratif", label: "Narratif", description: "Histoire, RPG, immersion" },
] as const;
