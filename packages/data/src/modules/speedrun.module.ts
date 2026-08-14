import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Speedrun module — games played for fastest completion (Super Mario 64,
 * Celeste, Ocarina of Time, Minecraft any%, ...). Tracks category, PB, rank
 * and splits. Composes with completion for the base game data.
 */
export const SpeedrunModule = defineModule({
  id: "speedrun",
  schema: z.object({
    hours: z.number().optional(),
    category: z.string().optional(),
    personalBest: z.string().optional(),
    worldRank: z.number().optional(),
    splits: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "category", label: "Catégorie", type: "select", optionsSource: "game.speedrunCategories" },
    { key: "personalBest", label: "Record personnel (PB)", type: "text", placeholder: "Ex. 16:42.350" },
    { key: "worldRank", label: "Classement mondial", type: "number", placeholder: "Ex. 12" },
    { key: "splits", label: "Détail des splits", type: "textarea", placeholder: "Temps par segment…" },
  ],
});
