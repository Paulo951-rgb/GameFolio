import { defineGame } from "@gamer-cv/core";

export const ZeldaTearsOfTheKingdom = defineGame({
  id: "zelda-totk",
  name: "Zelda: Tears of the Kingdom",
  publisher: "Nintendo",
  genres: ["action-aventure", "open world"],
  icon: "/icons/totk.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin principale", "Tous les sanctuaires", "Tous les Korogus", "Maître de l'aventure"],
  },
});
