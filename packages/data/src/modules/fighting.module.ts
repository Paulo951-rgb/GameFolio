import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Fighting game module — Street Fighter, Tekken, Mortal Kombat, Super Smash
 * Bros, Guilty Gear. Tracks rank, main character, sub characters, input device
 * and tournament experience.
 */
export const FightingModule = defineModule({
  id: "fighting",
  schema: z.object({
    hours: z.number().optional(),
    rank: z.string().optional(),
    mainCharacter: z.string().optional(),
    subCharacters: z.array(z.string()).optional(),
    inputDevice: z.enum(["manette", "arcade stick", "clavier", "hitbox"]).optional(),
    tournamentExperience: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "rank", label: "Rang", type: "select", optionsSource: "game.ranks" },
    { key: "mainCharacter", label: "Personnage principal", type: "select", optionsSource: "game.characters" },
    { key: "subCharacters", label: "Personnages secondaires", type: "multiselect", optionsSource: "game.characters" },
    { key: "inputDevice", label: "Périphérique", type: "select", options: ["manette", "arcade stick", "clavier", "hitbox"] },
    { key: "tournamentExperience", label: "Expérience tournoi (locals, online…)", type: "textarea" },
  ],
});
