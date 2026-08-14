import { defineGame } from "@gamer-cv/core";

export const TheLastOfUs = defineGame({
  id: "the-last-of-us",
  name: "The Last of Us (Part I & II)",
  publisher: "Sony Interactive Entertainment",
  developer: "Naughty Dog",
  genres: ["action", "aventure", "survival"],
  aliases: ["tlou", "the last of us", "last of us", "tlou2"],
  platforms: ["PC", "Console"],
  releaseYear: 2013,
  icon: "/icons/tlou.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Grounded", "100%", "Toutes les collectibles", "No Retry"],
  },
});
