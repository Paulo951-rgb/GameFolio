import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Achievement / trophy module — trophies, achievements, rare feats (PlayStation
 * trophies, Xbox achievements, Steam achievements). Tracks count, platinum/
 * 100%, rarest trophy and notable unlocks. Composes with completion.
 */
export const AchievementModule = defineModule({
  id: "achievement",
  schema: z.object({
    hours: z.number().optional(),
    achievementCount: z.number().optional(),
    platinum: z.string().optional(),
    rarest: z.string().optional(),
    notable: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "achievementCount", label: "Succès / trophées débloqués", type: "number" },
    { key: "platinum", label: "Platine / 100%", type: "select", options: ["oui", "non"] },
    { key: "rarest", label: "Trophée le plus rare", type: "text", placeholder: "Ex. Boss en solo sans dégât" },
    { key: "notable", label: "Succès notables", type: "textarea", placeholder: "Succès difficiles obtenus…" },
  ],
});
