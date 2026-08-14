import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Redstone / technical module — Minecraft redstone, command blocks, farms,
 * technical automation. Distinct from pure creative building: this tracks
 * mechanical/automation mastery (§9 Minecraft).
 */
export const RedstoneModule = defineModule({
  id: "redstone",
  schema: z.object({
    hours: z.number().optional(),
    level: z.enum(["débutant", "intermédiaire", "avancé", "expert"]).optional(),
    skills: z.array(z.string()).optional(),
    farms: z.array(z.string()).optional(),
    commandBlocks: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "level", label: "Niveau redstone/technique", type: "select", options: ["débutant", "intermédiaire", "avancé", "expert"] },
    { key: "skills", label: "Compétences techniques", type: "multiselect", options: ["Redstone", "Fermes automatiques", "Blocs de commande", "Datapacks", "Slime blocks", "TNT machines"] },
    { key: "farms", label: "Fermes construites", type: "textarea", placeholder: "Fosse à mobs, ferme à fer, raid farm…" },
    { key: "commandBlocks", label: "Projets en blocs de commande", type: "text", placeholder: "Systèmes, mini-jeux…" },
  ],
});
