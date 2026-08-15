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
  /** Ordered list of CV section ids (subset of CV_SECTION_IDS). Sections not
   *  listed are appended in canonical order. Omit to use the default order. */
  sectionOrder: z.array(z.string()).optional(),
  /** Section ids to hide entirely (presentation-only; the visibility engine
   *  still governs field-level visibility upstream). */
  hiddenSections: z.array(z.string()).optional(),
});
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

/**
 * Canonical, togglable/reorderable CV sections. The profile header (identity:
 * gamerTag, avatar, bio, socials) is always rendered and is therefore NOT in
 * this list — only the blocks a user may want to reorder or hide. A template
 * renders exactly these sections, in the order resolved by
 * `resolveSectionOrder(theme)` (apps/web), skipping any in `hiddenSections`.
 *
 * Keep ids stable: they are persisted in ThemeConfig and must not change.
 */
export const CV_SECTION_IDS = [
  "playerTypes",
  "badges",
  "about",
  "games",
  "achievements",
] as const;
export type CVSectionId = (typeof CV_SECTION_IDS)[number];

export const CV_SECTIONS: ReadonlyArray<{ id: CVSectionId; label: string }> = [
  { id: "playerTypes", label: "Profil de joueur" },
  { id: "badges", label: "Badges" },
  { id: "about", label: "Présentation IA" },
  { id: "games", label: "Détail par jeu" },
  { id: "achievements", label: "Achievements" },
];

/**
 * AI-generated CV text, stored SEPARATELY from raw data (GamerProfile.generatedText
 * vs ProfileGame.moduleData). Regeneration only touches this output, never the
 * source data. Structured JSON output (not free text) for reliable handling.
 *
 * V2 structure: the AI ANALYSES the profile (not just reformats it) and produces
 * a richer CV. The legacy `summary` / `strengths` / `perGame` fields are kept
 * (all optional) for backward compatibility with stored profiles and simpler
 * templates; the new fields drive the analysis-driven CV.
 *
 * Anti-hallucination rule (enforced upstream by verifyFacts): every number,
 * rank, character, role, hour... in the generated text MUST come from the
 * source data. The AI may synthesize, organize and deduce GENERAL tendencies,
 * but never invent a specific fact.
 */
export const GeneratedGameTextSchema = z.object({
  gameId: z.string(),
  title: z.string().optional(),
  /** 1-3 sentence intelligent description of the player's experience on this game. */
  description: z.string(),
  /** Concrete, sourced highlights (rank reached, hours, roles, projects...). */
  highlights: z.array(z.string()).default([]),
});
export type GeneratedGameText = z.infer<typeof GeneratedGameTextSchema>;

export const GeneratedTextSchema = z
  .object({
    // --- V2 analysis-driven fields ---
    /** Personalized presentation of the player. */
    profileSummary: z.string().optional(),
    /** Detected gaming identity / player profile, deduced from the data. */
    gamingIdentity: z.string().optional(),
    /** Strengths genuinely deduced from the data (general tendencies OK). */
    strengths: z.array(z.string()).default([]),
    /** Global experience summary across games. */
    experience: z.string().optional(),
    /** Specializations: roles, mechanics, skills, playstyles. */
    specializations: z.array(z.string()).default([]),
    /** Performance summary: ranks, records, progression. */
    performance: z.string().optional(),
    /** Per-game intelligent descriptions + highlights. */
    games: z.array(GeneratedGameTextSchema).default([]),
    // --- Legacy fields (kept for backward compat; populated by the generator) ---
    summary: z.string().optional(),
    perGame: z.record(z.string(), z.string()).default({}),
  })
  // A recognizable CV must carry at least one piece of generated content;
  // an empty/foreign object (e.g. `{nope: true}`) is a bad shape, not a CV.
  .refine(
    (g) =>
      Boolean(g.profileSummary ?? g.gamingIdentity ?? g.experience ?? g.performance ?? g.summary) ||
      g.strengths.length > 0 ||
      g.specializations.length > 0 ||
      g.games.length > 0 ||
      Object.keys(g.perGame).length > 0,
    "GeneratedText must contain at least one populated section",
  );
export type GeneratedText = z.infer<typeof GeneratedTextSchema>;

/**
 * Normalized view handed to a template component. Templates are presentation-only
 * and receive this normalized model so swapping templates never changes which
 * data is shown or how fields are selected.
 *
 * `badges` are computed from the real profile data (computeBadges) and
 * `achievements` are the user-added, visibility-filtered profile achievements.
 * Both are part of the normalized view so every render surface (preview,
 * export, public page) shows them consistently (WYSIWYG).
 */
export interface NormalizedCVData {
  personalInfo: import("./profile").PersonalInfo;
  playerTypes: string[];
  games: GameEntryPublic[];
  /** Auto-earned badges (computed upstream from real data, never fabricated). */
  badges: import("./badges").Badge[];
  /** User-added, visibility-filtered achievements. */
  achievements: import("./badges").Achievement[];
  generated?: GeneratedText;
}

import type { GameEntry } from "./game";
export type GameEntryPublic = Omit<GameEntry, "moduleData"> & {
  moduleData: Record<string, unknown>;
};
