import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Strategy module — RTS/4X/turn-based (Civilization, Age of Empires, StarCraft,
 * XCOM, Crusader Kings, Stellaris). Tracks rank/league, civilization/faction,
 * playstyle and APM where relevant.
 */
export const StrategyModule = defineModule({
  id: "strategy",
  schema: z.object({
    hours: z.number().optional(),
    rank: z.string().optional(),
    factions: z.array(z.string()).optional(),
    playstyle: z.enum(["agressif", "économique", "défensif", "scientifique", "polyvalent"]).optional(),
    apm: z.number().optional(),
    victories: z.number().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "rank", label: "Rang / ligue", type: "select", optionsSource: "game.ranks" },
    { key: "factions", label: "Civilisations / factions", type: "multiselect", optionsSource: "game.factions" },
    { key: "playstyle", label: "Style de jeu", type: "select", options: ["agressif", "économique", "défensif", "scientifique", "polyvalent"] },
    { key: "apm", label: "APM (actions/min)", type: "number", placeholder: "Ex. 150" },
    { key: "victories", label: "Victoires notables", type: "number" },
  ],
});
