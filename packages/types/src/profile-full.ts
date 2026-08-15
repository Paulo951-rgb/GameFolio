import { z } from "zod";
import { PersonalInfoSchema } from "./profile";
import { GameEntrySchema } from "./game";
import { ThemeConfigSchema, GeneratedTextSchema } from "./theme";
import { AchievementsSchema } from "./badges";

export const GamerProfileSchema = z.object({
  id: z.string(),
  personalInfo: PersonalInfoSchema,
  playerTypes: z.array(z.string()),
  games: z.array(GameEntrySchema),
  /** Profile-level, user-added achievements (see badges.ts). Default [] for
   *  backward compat with profiles persisted before this field existed. */
  achievements: AchievementsSchema,
  templateId: z.string(),
  themeConfig: ThemeConfigSchema,
  generatedText: GeneratedTextSchema.optional(),
});
export type GamerProfile = z.infer<typeof GamerProfileSchema>;

export { PersonalInfoSchema, GameEntrySchema, ThemeConfigSchema, GeneratedTextSchema };
