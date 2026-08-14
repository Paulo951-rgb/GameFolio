import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Competitive module — ranks, hours, roles, main characters, playstyle.
 * `optionsSource: "game.ranks"` etc. resolves concrete options at render time
 * from the owning game's gameData, so one module serves Valorant, LoL, CS, ...
 */
export const CompetitiveModule = defineModule({
  id: "competitive",
  schema: z.object({
    currentRank: z.string().optional(),
    highestRank: z.string().optional(),
    hours: z.number().optional(),
    roles: z.array(z.string()).optional(), // agents/champions/roles
    mainCharacters: z.array(z.string()).optional(),
    playstyle: z.enum(["agressif", "défensif", "polyvalent"]).optional(),
  }),
  fields: [
    { key: "currentRank", label: "Rang actuel", type: "select", optionsSource: "game.ranks" },
    { key: "highestRank", label: "Meilleur rang", type: "select", optionsSource: "game.ranks" },
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "roles", label: "Rôle(s)", type: "multiselect", optionsSource: "game.roles" },
    { key: "mainCharacters", label: "Personnages principaux", type: "multiselect", optionsSource: "game.characters" },
    { key: "playstyle", label: "Style de jeu", type: "select", options: ["agressif", "défensif", "polyvalent"] },
  ],
});
