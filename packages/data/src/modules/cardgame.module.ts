import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Card game module — Hearthstone, Legends of Runeterra, Marvel Snap, MTG Arena.
 * Tracks rank, decks/archetypes, collection and arena/draft performance.
 */
export const CardGameModule = defineModule({
  id: "cardgame",
  schema: z.object({
    hours: z.number().optional(),
    currentRank: z.string().optional(),
    highestRank: z.string().optional(),
    decks: z.array(z.string()).optional(),
    collectionPercent: z.number().min(0).max(100).optional(),
    arenaWins: z.number().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "currentRank", label: "Rang actuel", type: "select", optionsSource: "game.ranks" },
    { key: "highestRank", label: "Meilleur rang", type: "select", optionsSource: "game.ranks" },
    { key: "decks", label: "Decks / archétypes principaux", type: "multiselect", optionsSource: "game.decks" },
    { key: "collectionPercent", label: "Collection %", type: "number", placeholder: "0-100" },
    { key: "arenaWins", label: "Meilleur run arène / draft", type: "number", placeholder: "Ex. 12" },
  ],
});
