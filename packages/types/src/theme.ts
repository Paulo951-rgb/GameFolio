import { z } from "zod";

/**
 * ThemeConfig — pure presentation, never affects content or its selection logic
 * (those are owned by the visibility engine upstream). A template receives
 * NormalizedCVData + ThemeConfig and renders accordingly.
 */
export const ThemeConfigSchema = z.object({
  templateId: z.string(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  density: z.enum(["compact", "normal", "spacious"]).optional(),
  columns: z.number().int().min(1).max(3).optional(),
});
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

/**
 * AI-generated text, stored SEPARATELY from raw data (GamerProfile.generatedText
 * vs ProfileGame.moduleData). Regeneration only touches this output, never the
 * source data. Structured JSON output (not free text) for reliable handling.
 */
export const GeneratedTextSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  // gameId -> generated text
  perGame: z.record(z.string(), z.string()),
});
export type GeneratedText = z.infer<typeof GeneratedTextSchema>;

/**
 * Normalized view handed to a template component. Templates are presentation-only
 * and receive this normalized model so swapping templates never changes which
 * data is shown or how fields are selected.
 */
export interface NormalizedCVData {
  personalInfo: import("./profile.js").PersonalInfo;
  playerTypes: string[];
  games: GameEntryPublic[];
  generated?: GeneratedText;
}

import type { GameEntry } from "./game.js";
export type GameEntryPublic = Omit<GameEntry, "moduleData"> & {
  moduleData: Record<string, unknown>;
};
