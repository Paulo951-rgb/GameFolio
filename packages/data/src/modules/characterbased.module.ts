import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Character-based module — hero/agent/champion games (Overwatch, Valorant, LoL,
 * Apex Legends, Smite). Tracks main/secondary character pool, mastery and
 * comfort picks. Composes with competitive / moba / fighting.
 */
export const CharacterBasedModule = defineModule({
  id: "characterbased",
  schema: z.object({
    hours: z.number().optional(),
    mainCharacters: z.array(z.string()).optional(),
    secondaryCharacters: z.array(z.string()).optional(),
    mastery: z.enum(["one-trick", "petit pool", "pool varié", "flex"]).optional(),
    comfortPicks: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "mainCharacters", label: "Personnages principaux", type: "multiselect", optionsSource: "game.characters" },
    { key: "secondaryCharacters", label: "Personnages secondaires", type: "multiselect", optionsSource: "game.characters" },
    { key: "mastery", label: "Profil de pool", type: "select", options: ["one-trick", "petit pool", "pool varié", "flex"] },
    { key: "comfortPicks", label: "Comfort picks", type: "textarea", placeholder: "Persos pour ranked / tournois…" },
  ],
});
