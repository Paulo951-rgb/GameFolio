import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Sandbox module — hours, game modes, building, PvP, projects.
 * Reused across Minecraft-like sandbox/creative games.
 */
export const SandboxModule = defineModule({
  id: "sandbox",
  schema: z.object({
    hours: z.number().optional(),
    gameModes: z.array(z.string()).optional(),
    building: z.enum(["débutant", "intermédiaire", "avancé", "expert"]).optional(),
    pvp: z.string().optional(),
    projects: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "gameModes", label: "Mode(s) de jeu", type: "multiselect", optionsSource: "game.gameModes" },
    { key: "building", label: "Niveau de construction", type: "select", options: ["débutant", "intermédiaire", "avancé", "expert"] },
    { key: "pvp", label: "PvP actif", type: "select", options: ["oui", "non"] },
    { key: "projects", label: "Projets notables", type: "multiselect" },
  ],
});
