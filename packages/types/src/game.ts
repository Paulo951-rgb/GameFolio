import { z } from "zod";
import type { FieldDescriptor, ModuleDefinition } from "./module";

/**
 * Static game metadata + composition of generic modules.
 * A game definition NEVER contains UI code — only data. Adding a game is a new
 * file in packages/data/games, never a new React component.
 *
 * V2 enrichment: aliases (search shortcuts like "lol"), platforms (PC/PS5/...
 * — a single game spans platforms rather than being duplicated per platform),
 * developer, releaseYear and a short description. All optional & additive so
 * existing game definitions keep validating.
 */
export interface GameDefinition {
  readonly id: string;
  readonly name: string;
  readonly publisher?: string;
  readonly developer?: string;
  readonly genres: string[];
  /** Search aliases / abbreviations, e.g. ["lol", "league"]. */
  readonly aliases?: string[];
  /** Platforms the game is available on, e.g. ["PC", "PS5", "Switch"]. */
  readonly platforms?: string[];
  readonly releaseYear?: number;
  readonly description?: string;
  readonly icon?: string;
  readonly modules: string[]; // module ids to compose
  readonly gameData: Record<string, unknown>; // ranks, roles, characters, gameModes...
}

/**
 * Stored entry for a single game inside a profile. `moduleData` is a JSONB blob
 * validated dynamically against the composite schema of the resolved game
 * (resolveGameSchema(gameId)), NOT against a global schema that would have to
 * know every game. See GameEntrySchema below.
 */
export const GameEntrySchema = z.object({
  gameId: z.string(),
  // Validated dynamically at save time by the composite module schema.
  moduleData: z.record(z.string(), z.unknown()),
  freeText: z.string().optional(),
  order: z.number(),
});
export type GameEntry = z.infer<typeof GameEntrySchema>;

/**
 * A game resolved to its concrete module definitions + composite schema.
 * Produced by the module engine (packages/core/modules) from a GameDefinition
 * and the module registry.
 */
export interface ResolvedGame {
  readonly game: GameDefinition;
  readonly modules: ModuleDefinition[];
  readonly compositeSchema: z.ZodObject<z.ZodRawShape>;
  readonly fields: FieldDescriptor[];
}

/**
 * Registry helper types.
 */
export type GameRegistry = ReadonlyMap<string, GameDefinition>;
export type ModuleRegistry = ReadonlyMap<string, ModuleDefinition>;
