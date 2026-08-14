import { z } from "zod";

/**
 * Field descriptor — declarative rendering spec consumed by the generic
 * <DynamicGameForm> UI. A module exposes an array of these; the form engine
 * maps each `type` to the right input widget WITHOUT per-game code.
 *
 * `optionsSource` references game-provided value lists ("game.ranks",
 * "game.roles", "game.characters", "game.gameModes"). The form resolves the
 * concrete options at render time from the resolved game definition, keeping
 * modules reusable across games that share the same shape of data.
 */
export const FieldTypeSchema = z.enum([
  "text",
  "select",
  "multiselect",
  "number",
  "textarea",
]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FieldDescriptorSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: FieldTypeSchema,
  // Resolved dynamically against the owning game's gameData, e.g. "game.ranks".
  optionsSource: z.string().optional(),
  // Inline options when the field is not sourced from the game.
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  help: z.string().optional(),
});
export type FieldDescriptor = z.infer<typeof FieldDescriptorSchema>;

/**
 * Generic reusable module. A module = Zod schema + rendering field descriptors
 * + a stable schema version (see risk #5 / solution #5 in the architecture doc:
 * versioning enables light migration of stored JSONB profiles).
 */
export const ModuleSchemaMetaSchema = z.object({
  schemaVersion: z.number().default(1),
});
export type ModuleSchemaMeta = z.infer<typeof ModuleSchemaMetaSchema>;

// `defineModule` (packages/core/modules) constrains the runtime shape of these
// types; the descriptors here are the serializable subset used for the registry.
export interface ModuleDefinition<S extends z.ZodTypeAny = z.ZodTypeAny> {
  readonly id: string;
  readonly schema: S;
  readonly fields: FieldDescriptor[];
  readonly schemaVersion: number;
}
