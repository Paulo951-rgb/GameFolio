import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Survival module — hostile-world survival games (ARK, Valheim, Rust, 7 Days to
 * Die, Project Zomboid, Minecraft survival). Tracks hours, difficulty, base
 * building, PvE/PvP focus and survival feats. Composes with sandbox/building.
 */
export const SurvivalModule = defineModule({
  id: "survival",
  schema: z.object({
    hours: z.number().optional(),
    difficulty: z.enum(["facile", "normal", "difficile", "extrême", "hardcore"]).optional(),
    focus: z.array(z.string()).optional(),
    baseBuilding: z.enum(["débutant", "intermédiaire", "avancé", "expert"]).optional(),
    servers: z.array(z.string()).optional(),
    feats: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "difficulty", label: "Difficulté jouée", type: "select", options: ["facile", "normal", "difficile", "extrême", "hardcore"] },
    { key: "focus", label: "Centres d'intérêt", type: "multiselect", optionsSource: "game.survivalFocus" },
    { key: "baseBuilding", label: "Niveau de construction de base", type: "select", options: ["débutant", "intermédiaire", "avancé", "expert"] },
    { key: "servers", label: "Serveurs fréquentés", type: "text", placeholder: "Ex. Serveur officiel EU" },
    { key: "feats", label: "Exploits / réalisations", type: "textarea", placeholder: "Boss vaincus, raids, bases notables…" },
  ],
});
