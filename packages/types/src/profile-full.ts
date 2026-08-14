import { z } from "zod";
import { PersonalInfoSchema } from "./profile.js";
import { GameEntrySchema } from "./game.js";
import { ThemeConfigSchema, GeneratedTextSchema } from "./theme.js";

export const GamerProfileSchema = z.object({
  id: z.string(),
  personalInfo: PersonalInfoSchema,
  playerTypes: z.array(z.string()),
  games: z.array(GameEntrySchema),
  templateId: z.string(),
  themeConfig: ThemeConfigSchema,
  generatedText: GeneratedTextSchema.optional(),
});
export type GamerProfile = z.infer<typeof GamerProfileSchema>;

export { PersonalInfoSchema, GameEntrySchema, ThemeConfigSchema, GeneratedTextSchema };
