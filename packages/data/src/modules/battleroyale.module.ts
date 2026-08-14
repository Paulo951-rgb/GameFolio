import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Battle royale module — matches, wins (Victoires royales), K/D, season rank.
 * Reused across BR games (Apex, Fortnite, PUBG, Warzone, ...). Composes with
 * `competitive` for games that also expose a ranked ladder.
 */
export const BattleRoyaleModule = defineModule({
  id: "battleroyale",
  schema: z.object({
    matches: z.number().optional(),
    wins: z.number().optional(),
    kdRatio: z.number().optional(),
    seasonRank: z.string().optional(),
    hours: z.number().optional(),
  }),
  fields: [
    { key: "matches", label: "Parties jouées", type: "number" },
    { key: "wins", label: "Victoires royales", type: "number" },
    { key: "kdRatio", label: "Ratio K/D", type: "number" },
    { key: "seasonRank", label: "Rang de saison", type: "select", optionsSource: "game.ranks" },
    { key: "hours", label: "Heures approximatives", type: "number" },
  ],
});
