import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * MOBA module — League of Legends, Dota 2, Wild Rift, Smite. Tracks lane/role,
 * champion/hero pool, MMR/rank, KDA and match volume. Overlaps `competitive` on
 * ranks/roles/characters (last-write-wins); composes with competitive for the
 * shared competitive fields.
 */
export const MobaModule = defineModule({
  id: "moba",
  schema: z.object({
    hours: z.number().optional(),
    currentRank: z.string().optional(),
    highestRank: z.string().optional(),
    roles: z.array(z.string()).optional(),
    mainCharacters: z.array(z.string()).optional(),
    matches: z.number().optional(),
    kda: z.string().optional(),
    playstyle: z.enum(["agressif", "défensif", "polyvalent", "support", "farm"]).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "currentRank", label: "Rang actuel", type: "select", optionsSource: "game.ranks" },
    { key: "highestRank", label: "Meilleur rang", type: "select", optionsSource: "game.ranks" },
    { key: "roles", label: "Rôles / lanes", type: "multiselect", optionsSource: "game.roles" },
    { key: "mainCharacters", label: "Champions / héros principaux", type: "multiselect", optionsSource: "game.characters" },
    { key: "matches", label: "Parties classées jouées", type: "number" },
    { key: "kda", label: "KDA moyen", type: "text", placeholder: "Ex. 3.2 / 2.1 / 5.4" },
    { key: "playstyle", label: "Style de jeu", type: "select", options: ["agressif", "défensif", "polyvalent", "support", "farm"] },
  ],
});
