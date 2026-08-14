import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Clan module — clan role, clan level, war participation.
 * Reused across clan/guild-based games (CoC, Clash Royale, WoW, ...).
 */
export const ClanModule = defineModule({
  id: "clan",
  schema: z.object({
    clanName: z.string().optional(),
    clanRole: z.string().optional(),
    clanLevel: z.number().optional(),
    warParticipation: z.string().optional(),
    warsWon: z.number().optional(),
  }),
  fields: [
    { key: "clanName", label: "Nom du clan", type: "text" },
    { key: "clanRole", label: "Rôle dans le clan", type: "select", optionsSource: "game.clanRoles" },
    { key: "clanLevel", label: "Niveau du clan", type: "number" },
    { key: "warParticipation", label: "Participe aux guerres de clan", type: "select", options: ["oui", "non"] },
    { key: "warsWon", label: "Guerres remportées", type: "number" },
  ],
});
