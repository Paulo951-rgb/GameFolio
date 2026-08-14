import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Content creator module — streamers, YouTubers, map/mode creators (Roblox,
 * Minecraft, Fortnite Creative, Trackmania, ...). Tracks platform, audience,
 * content type and notable creations. Distinct from competitive performance.
 */
export const ContentCreatorModule = defineModule({
  id: "contentcreator",
  schema: z.object({
    hours: z.number().optional(),
    platform: z.array(z.string()).optional(),
    contentType: z.array(z.string()).optional(),
    audience: z.number().optional(),
    creations: z.array(z.string()).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "platform", label: "Plateforme(s)", type: "multiselect", options: ["Twitch", "YouTube", "TikTok", "Kick", "Autre"] },
    { key: "contentType", label: "Type de contenu", type: "multiselect", options: ["Stream", "Vidéo", "Tutoriel", "Esport", "Créatif", "Speedrun", "Let's Play"] },
    { key: "audience", label: "Communauté (abonnés/env.)", type: "number", placeholder: "Ex. 1200" },
    { key: "creations", label: "Créations notables", type: "textarea", placeholder: "Maps, modes, séries, événements…" },
  ],
});
