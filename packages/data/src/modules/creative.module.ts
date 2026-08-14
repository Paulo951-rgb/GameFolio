import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Creative module — pure creative / sandbox expression (Minecraft créatif,
 * Roblox, Fortnite Creative, Dreams, Mario Maker). Tracks creations, modes
 * and tools. Composes with building / contentcreator.
 */
export const CreativeModule = defineModule({
  id: "creative",
  schema: z.object({
    hours: z.number().optional(),
    creations: z.array(z.string()).optional(),
    modes: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "creations", label: "Créations réalisées", type: "textarea", placeholder: "Maps, modes, mondes, œuvres…" },
    { key: "modes", label: "Modes créatifs", type: "multiselect", optionsSource: "game.gameModes" },
    { key: "tools", label: "Outils", type: "multiselect", options: ["Éditeur in-game", "Blockbench", "WorldEdit", "Unity", "Unreal", "Roblox Studio"] },
  ],
});
