import { defineGame } from "@gamer-cv/core";

export const Hades = defineGame({
  id: "hades",
  name: "Hades",
  publisher: "Supergiant Games",
  genres: ["roguelike", "action"],
  icon: "/icons/hades.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin du pacte 32 chaleur", "Tous les vœux exaucés", "Vaincre Cronos"],
  },
});
