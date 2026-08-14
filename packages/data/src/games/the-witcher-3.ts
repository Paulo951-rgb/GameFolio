import { defineGame } from "@gamer-cv/core";

export const TheWitcher3 = defineGame({
  id: "the-witcher-3",
  name: "The Witcher 3: Wild Hunt",
  publisher: "CD Projekt Red",
  genres: ["RPG", "action"],
  icon: "/icons/witcher3.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin de l'histoire principale", "Tous les contrats", "Tous les Gwynt", "Blood and Wine 100%"],
  },
});
