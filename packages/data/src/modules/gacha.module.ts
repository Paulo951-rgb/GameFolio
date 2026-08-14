import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Gacha / mobile-collection module — account level, pulls, units owned,
 * collection completion, spending tier. Reused across mobile gacha games
 * (Genshin, Honkai, FGO, Arknights, ...).
 */
export const GachaModule = defineModule({
  id: "gacha",
  schema: z.object({
    accountLevel: z.number().optional(),
    hours: z.number().optional(),
    pulls: z.number().optional(),
    rarityOwned: z.array(z.string()).optional(),
    completionPercent: z.number().min(0).max(100).optional(),
    spendingTier: z.enum(["f2p", "low-spender", "dolphin", "whale"]).optional(),
  }),
  fields: [
    { key: "accountLevel", label: "Niveau de compte", type: "number" },
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "pulls", label: "Invocations totales", type: "number" },
    { key: "rarityOwned", label: "Unités rares possédées", type: "multiselect", optionsSource: "game.units" },
    { key: "completionPercent", label: "Pourcentage de collection", type: "number" },
    { key: "spendingTier", label: "Profil de dépense", type: "select", options: ["f2p", "low-spender", "dolphin", "whale"] },
  ],
});
