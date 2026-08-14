import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Progression module — account level, XP, town-hall/account rank.
 * Reused across progression-heavy games (Clash Royale, Clash of Clans, ...).
 */
export const ProgressionModule = defineModule({
  id: "progression",
  schema: z.object({
    accountLevel: z.number().optional(),
    arena: z.string().optional(),
    hours: z.number().optional(),
    trophies: z.number().optional(),
    rank: z.string().optional(),
  }),
  fields: [
    { key: "accountLevel", label: "Niveau de compte", type: "number" },
    { key: "arena", label: "Arène / ligue", type: "select", optionsSource: "game.arenas" },
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "trophies", label: "Trophées", type: "number" },
    { key: "rank", label: "Rang", type: "select", optionsSource: "game.ranks" },
  ],
});
