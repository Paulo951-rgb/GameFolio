import { z } from "zod";
import { GamerProfileSchema } from "@gamer-cv/types";

/**
 * Server-side request body validation. The profile is re-validated with the
 * shared schema (never trust client data — §3). The optional `instruction`
 * is bounded in length to limit prompt-injection / cost abuse (§18 risk #6).
 */
export const GenerateBodySchema = z.object({
  profile: GamerProfileSchema,
});

export const RegenerateBodySchema = z.object({
  profile: GamerProfileSchema,
  instruction: z.string().trim().min(1).max(300),
});

export type GenerateBody = z.infer<typeof GenerateBodySchema>;
export type RegenerateBody = z.infer<typeof RegenerateBodySchema>;
