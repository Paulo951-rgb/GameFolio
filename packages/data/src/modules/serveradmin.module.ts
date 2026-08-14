import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Server admin / community module — Minecraft, Rust, ARK, Garry's Mod server
 * administration. Tracks server ownership, role, plugins, community size.
 */
export const ServerAdminModule = defineModule({
  id: "serveradmin",
  schema: z.object({
    hours: z.number().optional(),
    role: z.string().optional(),
    ownsServer: z.string().optional(),
    plugins: z.array(z.string()).optional(),
    communitySize: z.number().optional(),
    duties: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "role", label: "Rôle serveur", type: "select", options: ["Joueur", "Modérateur", "Admin", "Owner", "Développeur plugin"] },
    { key: "ownsServer", label: "Serveur possédé / géré", type: "text", placeholder: "Nom du serveur" },
    { key: "plugins", label: "Plugins / mods gérés", type: "textarea", placeholder: "Essentials, LuckPerms…" },
    { key: "communitySize", label: "Taille de la communauté", type: "number", placeholder: "Nombre de membres" },
    { key: "duties", label: "Responsabilités", type: "textarea", placeholder: "Modération, événements, config…" },
  ],
});
