import { z } from "zod";

/**
 * Achievements — profile-level accomplishments manually added by the player
 * (NOT auto-derived, unlike badges). Each is optionally linked to a game,
 * dated, and may carry a proof link (screenshot, video, tournament page…).
 *
 * Anti-hallucination: these are user-asserted facts the player chose to
 * surface. They never feed the AI prompt as "verified stats" — the generator
 * treats them as self-reported context, same as freeText. We store them
 * separately from moduleData so they aren't coupled to a single game's schema.
 */
export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  /** Game id this achievement relates to, or null for cross-game/general. */
  gameId: z.string().nullable().optional(),
  /** ISO date string (YYYY-MM-DD) — optional, the player may not remember. */
  date: z.string().optional(),
  /** Optional proof URL (screenshot, VOD, tournament page…). */
  proofUrl: z.string().url().optional(),
});
export type Achievement = z.infer<typeof AchievementSchema>;

export const AchievementsSchema = z.array(AchievementSchema).default([]);
export type Achievements = z.infer<typeof AchievementsSchema>;

/**
 * Badge — a label the player EARNS automatically because a verifiable
 * condition holds against their REAL data. Badges are NEVER attributed when
 * the condition isn't met (architecture §11). The condition is evaluated by
 * pure functions in packages/core/badges, not by the UI.
 *
 * `category` groups badges in the profile (playstyle, volume, mastery,
 * competition…). `icon` is an emoji kept in data (not UI) so templates can
 * render it consistently.
 */
export const BadgeCategorySchema = z.enum([
  "playstyle",
  "volume",
  "mastery",
  "competition",
  "diversity",
]);
export type BadgeCategory = z.infer<typeof BadgeCategorySchema>;

export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: BadgeCategorySchema,
});
export type Badge = z.infer<typeof BadgeSchema>;
