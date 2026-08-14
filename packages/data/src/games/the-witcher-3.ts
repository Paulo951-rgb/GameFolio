import { defineGame } from "@gamer-cv/core";

export const TheWitcher3 = defineGame({
  id: "the-witcher-3",
  name: "The Witcher 3: Wild Hunt",
  publisher: "CD Projekt Red",
  developer: "CD Projekt Red",
  genres: ["RPG", "action", "open-world"],
  aliases: ["witcher", "witcher 3", "the witcher", "sorceleur"],
  platforms: ["PC", "Console"],
  releaseYear: 2015,
  icon: "/icons/witcher3.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire principale", "Tous les contrats", "Tous les Gwynt", "Blood and Wine 100%", "Hearts of Stone 100%"],
  },
});
