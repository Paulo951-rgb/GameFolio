import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Single-player module — progression, completion %, difficulty, trophies.
 * Reused across story/solo games (Hollow Knight, Hades, Zelda, ...).
 */
export const SinglePlayerModule = defineModule({
  id: "singleplayer",
  schema: z.object({
    completionPercent: z.number().min(0).max(100).optional(),
    hours: z.number().optional(),
    difficulty: z.enum(["facile", "normal", "difficile", "extrême"]).optional(),
    trophies: z.array(z.string()).optional(),
    progress: z.string().optional(), // e.g. "Boss final atteint"
  }),
  fields: [
    { key: "completionPercent", label: "Pourcentage de complétion", type: "number" },
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "difficulty", label: "Difficulté", type: "select", options: ["facile", "normal", "difficile", "extrême"] },
    { key: "trophies", label: "Trophées / succès notables", type: "multiselect" },
    { key: "progress", label: "Progression / point atteint", type: "text" },
  ],
});
