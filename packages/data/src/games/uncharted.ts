import { defineGame } from "@gamer-cv/core";

export const Uncharted = defineGame({
  id: "uncharted",
  name: "Uncharted (série)",
  publisher: "Sony Interactive Entertainment",
  developer: "Naughty Dog",
  genres: ["action", "aventure", "plateforme"],
  aliases: ["uncharted", "uncharted 4", "uc4", "drake"],
  platforms: ["PC", "Console"],
  releaseYear: 2007,
  icon: "/icons/uncharted.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Toutes les collectibles", "100%", "Crushing", "Brutal"],
  },
});
