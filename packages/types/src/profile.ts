import { z } from "zod";

/**
 * Per-field visibility controls how a value is exposed.
 *  - visible : shown publicly and sent to the AI generator
 *  - hidden  : omitted from public page AND from AI generation
 *  - private : stored but never rendered to anyone except the owner
 *
 * Visibility is enforced BEFORE any public exposure or AI prompt is built
 * (see packages/core/visibility). A field flagged private/hidden must never
 * reach the /cv/[slug] page or the generation pipeline.
 */
export const FieldVisibilitySchema = z.enum(["visible", "hidden", "private"]);
export type FieldVisibility = z.infer<typeof FieldVisibilitySchema>;

export const SocialsSchema = z.record(z.string(), z.string()).optional();
export type Socials = z.infer<typeof SocialsSchema>;

export const VisibilityMapSchema = z.record(z.string(), FieldVisibilitySchema);
export type VisibilityMap = z.infer<typeof VisibilityMapSchema>;

export const PersonalInfoSchema = z.object({
  gamerTag: z.string().min(1),
  firstName: z.string().optional(),
  age: z.number().int().positive().optional(),
  country: z.string().optional(),
  languages: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional(),
  socials: SocialsSchema, // { discord: "...", twitch: "..." }
  // visibility keyed by field name; defaults to "visible" when absent.
  visibility: VisibilityMapSchema,
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
