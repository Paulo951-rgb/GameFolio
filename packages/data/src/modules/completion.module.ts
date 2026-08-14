import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Completion / single-player progression module (§10) — story/solo games
 * (God of War, Spider-Man, The Witcher, Elden Ring, ...). Tracks completion %,
 * finished state, difficulty, New Game+, side content and personal experience.
 * Richer sibling of the legacy `singleplayer` module; composes with achievement.
 */
export const CompletionModule = defineModule({
  id: "completion",
  schema: z.object({
    hours: z.number().optional(),
    finished: z.string().optional(),
    completionPercent: z.number().min(0).max(100).optional(),
    difficulty: z.enum(["facile", "normal", "difficile", "très difficile", "extrême"]).optional(),
    newGamePlus: z.string().optional(),
    sideContent: z.array(z.string()).optional(),
    progress: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "finished", label: "Histoire terminée", type: "select", options: ["oui", "non", "en cours"] },
    { key: "completionPercent", label: "Pourcentage de complétion", type: "number", placeholder: "0-100" },
    { key: "difficulty", label: "Difficulté", type: "select", options: ["facile", "normal", "difficile", "très difficile", "extrême"] },
    { key: "newGamePlus", label: "New Game+", type: "select", options: ["oui", "non"] },
    { key: "sideContent", label: "Contenu secondaire", type: "multiselect", options: ["Quêtes secondaires", "Collectibles", "Boss optionnels", "Endgame", "100%"] },
    { key: "progress", label: "Progression / point atteint", type: "text", placeholder: "Ex. Boss final atteint" },
  ],
});
