import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Modding module — game modifications (Minecraft mods/modpacks, Skyrim mods,
 * Cities: Skylines, Garry's Mod, ...). Tracks mods used, modpacks, custom
 * content created and tools.
 */
export const ModdingModule = defineModule({
  id: "modding",
  schema: z.object({
    hours: z.number().optional(),
    modsUsed: z.array(z.string()).optional(),
    modpacks: z.array(z.string()).optional(),
    created: z.string().optional(),
    tools: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "modsUsed", label: "Mods utilisés", type: "textarea", placeholder: "Create, JEI, Optifine…" },
    { key: "modpacks", label: "Modpacks joués", type: "textarea", placeholder: "FTB, All The Mods…" },
    { key: "created", label: "Contenu créé (mods, datapacks, plugins…)", type: "textarea", placeholder: "Mods développés, config custom…" },
    { key: "tools", label: "Outils", type: "multiselect", options: ["MCreator", "Blockbench", "IntelliJ", "Forge", "Fabric", "Bukkit/Spigot"] },
  ],
});
