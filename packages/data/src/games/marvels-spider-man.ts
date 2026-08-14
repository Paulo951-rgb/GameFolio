import { defineGame } from "@gamer-cv/core";

export const MarvelsSpiderMan = defineGame({
  id: "marvels-spider-man",
  name: "Marvel's Spider-Man",
  publisher: "Sony Interactive Entertainment",
  developer: "Insomniac Games",
  genres: ["action", "adventure", "open-world"],
  aliases: ["spiderman", "spider-man", "spider man", "marvels spider man"],
  platforms: ["PC", "Console"],
  releaseYear: 2018,
  icon: "/icons/spiderman.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Tous les costumes", "Toutes les missions", "100%", "Toutes les pierres"],
  },
});
