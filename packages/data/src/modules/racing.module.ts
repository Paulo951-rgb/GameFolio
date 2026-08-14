import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Racing module — lap times, podiums, discipline, assists.
 * Reused across racing games (Forza, Gran Turismo, Mario Kart, Trackmania, ...).
 */
export const RacingModule = defineModule({
  id: "racing",
  schema: z.object({
    discipline: z.string().optional(),
    hours: z.number().optional(),
    bestLapTime: z.string().optional(),
    podiums: z.number().optional(),
    assists: z.array(z.string()).optional(),
    playstyle: z.enum(["agressif", "défensif", "polyvalent"]).optional(),
  }),
  fields: [
    { key: "discipline", label: "Discipline", type: "select", optionsSource: "game.disciplines" },
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "bestLapTime", label: "Meilleur temps au tour", type: "text", placeholder: "1:32.450" },
    { key: "podiums", label: "Podiums remportés", type: "number" },
    { key: "assists", label: "Aides utilisées", type: "multiselect", options: ["ABS", "Traction", "Stabilité", "Ligne de course", "Aucune"] },
    { key: "playstyle", label: "Style de conduite", type: "select", options: ["agressif", "défensif", "polyvalent"] },
  ],
});
