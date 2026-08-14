import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Building module — creative construction (Minecraft, Terraria, Roblox, Valheim).
 * Tracks build skill, specialities (médiéval, moderne, redstone…), projects and
 * screenshots. Composes with sandbox / redstone / creative.
 */
export const BuildingModule = defineModule({
  id: "building",
  schema: z.object({
    hours: z.number().optional(),
    skill: z.enum(["débutant", "intermédiaire", "avancé", "expert"]).optional(),
    specialties: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "skill", label: "Niveau de construction", type: "select", options: ["débutant", "intermédiaire", "avancé", "expert"] },
    { key: "specialties", label: "Spécialités", type: "multiselect", optionsSource: "game.buildSpecialties" },
    { key: "projects", label: "Projets notables", type: "textarea", placeholder: "Châteaux, villes, maps…" },
    { key: "tools", label: "Outils utilisés", type: "multiselect", optionsSource: "game.buildTools" },
  ],
});
