import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Guild module — MMO guild / clan with role, progression and raiding. Distinct
 * from the mobile `clan` module (war participation / trophies): this tracks
 * guild role, raiding and roster. Overlaps clan on clanName/clanRole.
 */
export const GuildModule = defineModule({
  id: "guild",
  schema: z.object({
    guildName: z.string().optional(),
    guildRole: z.string().optional(),
    guildLevel: z.number().optional(),
    raiding: z.string().optional(),
    rosterSize: z.number().optional(),
  }),
  fields: [
    { key: "guildName", label: "Nom de la guilde", type: "text" },
    { key: "guildRole", label: "Rôle dans la guilde", type: "select", options: ["Membre", "Officier", "Chef adjoint", "Chef", "Lead raid"] },
    { key: "guildLevel", label: "Niveau de guilde", type: "number" },
    { key: "raiding", label: "Activité raid", type: "text", placeholder: "Ex. 2 soirs / semaine Mythique" },
    { key: "rosterSize", label: "Taille du roster", type: "number" },
  ],
});
