import { defineGame } from "@gamer-cv/core";

export const Fallout = defineGame({
  id: "fallout",
  name: "Fallout (série)",
  publisher: "Bethesda Softworks",
  developer: "Bethesda Game Studios / Obsidian",
  genres: ["RPG", "action", "open-world"],
  aliases: ["fallout", "fallout 4", "fallout new vegas", "fo4", "fonv"],
  platforms: ["PC", "Console"],
  releaseYear: 1997,
  icon: "/icons/fallout.svg",
  modules: ["completion", "achievement", "modding"],
  gameData: {
    trophies: ["Fin de l'histoire", "Toutes les factions", "100%", "Moddé"],
  },
});
