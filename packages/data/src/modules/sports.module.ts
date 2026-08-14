import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Sports module — EA Sports FC/FIFA, NBA 2K, Madden, eFootball. Tracks
 * division/rank, team/club, playstyle and online record. Distinct from racing.
 */
export const SportsModule = defineModule({
  id: "sports",
  schema: z.object({
    hours: z.number().optional(),
    division: z.string().optional(),
    club: z.string().optional(),
    playstyle: z.enum(["agressif", "possessif", "défensif", "contre-attaque", "polyvalent"]).optional(),
    wins: z.number().optional(),
    mode: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "division", label: "Division / rang", type: "select", optionsSource: "game.ranks" },
    { key: "club", label: "Club / équipe", type: "text", placeholder: "Ex. club pro / Ultimate Team" },
    { key: "playstyle", label: "Style de jeu", type: "select", options: ["agressif", "possessif", "défensif", "contre-attaque", "polyvalent"] },
    { key: "wins", label: "Victoires en ligne", type: "number" },
    { key: "mode", label: "Modes joués", type: "multiselect", optionsSource: "game.modes" },
  ],
});
