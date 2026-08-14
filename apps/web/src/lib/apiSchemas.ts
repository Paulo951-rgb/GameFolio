import { z } from "zod";
import {
  GamerProfileSchema,
  GenerationModeSchema,
  GenerationPersonalitySchema,
} from "@gamer-cv/types";

/**
 * Server-side request body validation. The profile is re-validated with the
 * shared schema (never trust client data — §3). The optional `instruction`
 * is bounded in length to limit prompt-injection / cost abuse (§18 risk #6).
 * `mode` (§18) and `personality` (§19) drive the prompt; both optional.
 */
const GenerationOptions = {
  mode: GenerationModeSchema.optional(),
  personality: GenerationPersonalitySchema.optional(),
};

export const GenerateBodySchema = z.object({
  profile: GamerProfileSchema,
  ...GenerationOptions,
});

export const RegenerateBodySchema = z.object({
  profile: GamerProfileSchema,
  instruction: z.string().trim().min(1).max(300),
  ...GenerationOptions,
});

export const ExportBodySchema = z.object({
  profile: GamerProfileSchema,
  format: z.enum(["pdf", "png"]).default("pdf"),
});

export type GenerateBody = z.infer<typeof GenerateBodySchema>;
export type RegenerateBody = z.infer<typeof RegenerateBodySchema>;
export type ExportBody = z.infer<typeof ExportBodySchema>;
