import { z } from "zod";
import type {
  FieldDescriptor,
  ModuleDefinition,
  GameDefinition,
  GameRegistry,
  ModuleRegistry,
  ResolvedGame,
} from "@gamer-cv/types";

/**
 * `defineModule` is the ONLY sanctioned way to author a reusable module.
 * It pins a stable schemaVersion (stored alongside each ProfileGame so stored
 * JSONB profiles can be migrated lightly when a module schema evolves — see
 * risk #5 / solution #5) and keeps the schema + field descriptors in one place.
 */
export function defineModule<S extends z.ZodTypeAny>(input: {
  id: string;
  schema: S;
  fields: FieldDescriptor[];
  schemaVersion?: number;
}): ModuleDefinition<S> {
  if (input.fields.length === 0) {
    throw new Error(`Module "${input.id}" must declare at least one field`);
  }
  return {
    id: input.id,
    schema: input.schema,
    fields: input.fields,
    schemaVersion: input.schemaVersion ?? 1,
  };
}

/**
 * `defineGame` is the ONLY sanctioned way to author a game definition. A game
 * references module ids by composition; it never embeds UI code. Validation runs
 * here so a misconfigured game fails at registry build, not at user runtime.
 */
export function defineGame(game: GameDefinition): GameDefinition {
  if (game.modules.length === 0) {
    throw new Error(`Game "${game.id}" must compose at least one module`);
  }
  if (!game.id || !game.name) {
    throw new Error("Game definition requires id and name");
  }
  return game;
}

/**
 * Compose the Zod schemas of several modules into a single composite object
 * schema. Uses z.object merge semantics via spread of `.shape`, i.e.
 * last-write-wins. Overlapping keys across modules are allowed because
 * generic modules intentionally share semantic fields (e.g. `hours`,
 * `completionPercent`, `accountLevel` mean the same thing everywhere); the
 * composing game merely picks the later module's shape for that key. Field
 * descriptors are deduplicated the same way (mergeFields).
 */
export function composeSchemas(
  modules: ModuleDefinition[],
): z.ZodObject<z.ZodRawShape> {
  if (modules.length === 0) {
    throw new Error("composeSchemas requires at least one module");
  }
  const shape: z.ZodRawShape = {};
  for (const m of modules) {
    if (!(m.schema instanceof z.ZodObject)) {
      throw new Error(
        `Module "${m.id}" schema must be a z.object to be composable`,
      );
    }
    for (const key of Object.keys(m.schema.shape)) {
      // last-write-wins: a later module overrides an earlier one's field.
      shape[key] = m.schema.shape[key];
    }
  }
  return z.object(shape);
}

/**
 * Merge the field descriptors of several modules, preserving module order then
 * field order. Deduplicates by key (last-write-wins), matching composeSchemas.
 */
export function mergeFields(modules: ModuleDefinition[]): FieldDescriptor[] {
  // Last-write-wins: a later module's descriptor overrides an earlier one's for
  // the same key, matching composeSchemas. We keep a Map so the field ORDER
  // stays that of first appearance (stable for form rendering) while the value
  // is the latest.
  const byKey = new Map<string, FieldDescriptor>();
  const order: string[] = [];
  for (const m of modules) {
    for (const f of m.fields) {
      if (!byKey.has(f.key)) order.push(f.key);
      byKey.set(f.key, f);
    }
  }
  return order.map((k) => byKey.get(k)!);
}

/**
 * Resolve a game: look up its modules in the module registry and return the
 * concrete module definitions + the composite schema + the merged fields.
 * Throws if the game references an unknown module id — caught at registry
 * build time, never at user runtime.
 */
export function resolveGame(
  game: GameDefinition,
  moduleRegistry: ModuleRegistry,
): ResolvedGame {
  const modules: ModuleDefinition[] = [];
  for (const moduleId of game.modules) {
    const mod = moduleRegistry.get(moduleId);
    if (!mod) {
      throw new Error(
        `Game "${game.id}" references unknown module "${moduleId}"`,
      );
    }
    modules.push(mod);
  }
  return {
    game,
    modules,
    compositeSchema: composeSchemas(modules),
    fields: mergeFields(modules),
  };
}

/**
 * Convenience: resolve the composite schema for a game id directly. Returns
 * null when the game is unknown (callers should decide how to surface that),
 * rather than throwing, since user-selected game ids are the input here.
 */
export function resolveGameSchema(
  gameId: string,
  gameRegistry: GameRegistry,
  moduleRegistry: ModuleRegistry,
): z.ZodObject<z.ZodRawShape> | null {
  const game = gameRegistry.get(gameId);
  if (!game) return null;
  return resolveGame(game, moduleRegistry).compositeSchema;
}

/**
 * Validate a stored moduleData blob for a given game. Returns parsed data or
 * a structured error; never throws on bad data (the DB already accepted it as
 * JSONB — we want to report drift, not crash).
 */
export function validateGameEntry(
  gameId: string,
  moduleData: Record<string, unknown>,
  gameRegistry: GameRegistry,
  moduleRegistry: ModuleRegistry,
):
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: z.ZodError } {
  const schema = resolveGameSchema(gameId, gameRegistry, moduleRegistry);
  if (!schema) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: "custom",
          path: ["gameId"],
          message: `Unknown game "${gameId}"`,
        },
      ]),
    };
  }
  const result = schema.safeParse(moduleData);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
