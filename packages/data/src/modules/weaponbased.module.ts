import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Weapon-based module — shooter games where the loadout/weapon mastery is the
 * core (CS2, Valorant, Call of Duty, Battlefield, Tarkov, Apex). Tracks main
 * weapons, attachments and aim profile. Composes with competitive.
 */
export const WeaponBasedModule = defineModule({
  id: "weaponbased",
  schema: z.object({
    hours: z.number().optional(),
    mainWeapons: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
    aimProfile: z.enum(["hitscan", "projectile", "mixte"]).optional(),
    sensitivity: z.string().optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "mainWeapons", label: "Armes principales", type: "multiselect", optionsSource: "game.weapons" },
    { key: "attachments", label: "Attachments / build", type: "textarea", placeholder: "Configs d'armes…" },
    { key: "aimProfile", label: "Profil de visée", type: "select", options: ["hitscan", "projectile", "mixte"] },
    { key: "sensitivity", label: "Sensibilité (eDPI)", type: "text", placeholder: "Ex. 800 DPI / 0.4" },
  ],
});
