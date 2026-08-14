import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * MMO module — World of Warcraft, FFXIV, Destiny 2, ESO, Lost Ark. Tracks
 * class/role, level/ilevel, raid progression, guild and endgame activity.
 * Composes with guild / progression for shared fields.
 */
export const MmoModule = defineModule({
  id: "mmo",
  schema: z.object({
    hours: z.number().optional(),
    classRole: z.string().optional(),
    level: z.number().optional(),
    itemLevel: z.number().optional(),
    raidProgression: z.string().optional(),
    endgame: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "classRole", label: "Classe / rôle principal", type: "select", optionsSource: "game.classes" },
    { key: "level", label: "Niveau", type: "number" },
    { key: "itemLevel", label: "Niveau d'objet / ilvl", type: "number" },
    { key: "raidProgression", label: "Progression raid / endgame", type: "text", placeholder: "Ex. Boss 4/8 Mythique" },
    { key: "endgame", label: "Activités endgame", type: "multiselect", optionsSource: "game.endgame" },
  ],
});
