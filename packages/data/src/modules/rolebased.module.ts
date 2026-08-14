import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Role-based module — games structured around distinct roles/classes (Overwatch,
 * Rainbow Six Siege, Destiny 2, MMORPGs). Tracks primary/secondary roles and
 * role mastery. Composes with competitive / mmo.
 */
export const RoleBasedModule = defineModule({
  id: "rolebased",
  schema: z.object({
    hours: z.number().optional(),
    primaryRole: z.string().optional(),
    secondaryRoles: z.array(z.string()).optional(),
    roleMastery: z.enum(["débutant", "intermédiaire", "avancé", "expert"]).optional(),
    flex: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "primaryRole", label: "Rôle principal", type: "select", optionsSource: "game.roles" },
    { key: "secondaryRoles", label: "Rôles secondaires", type: "multiselect", optionsSource: "game.roles" },
    { key: "roleMastery", label: "Maîtrise du rôle", type: "select", options: ["débutant", "intermédiaire", "avancé", "expert"] },
    { key: "flex", label: "Capacité à flex (changement de rôle)", type: "select", options: ["oui", "non"] },
  ],
});
