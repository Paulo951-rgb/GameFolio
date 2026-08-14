import { defineGame } from "@gamer-cv/core";

export const Hades = defineGame({
  id: "hades",
  name: "Hades",
  publisher: "Supergiant Games",
  developer: "Supergiant Games",
  genres: ["roguelike", "action"],
  aliases: ["hades", "hades 2"],
  platforms: ["PC", "Console"],
  icon: "/icons/hades.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin du pacte 32 chaleur", "Tous les vœux exaucés", "Vaincre Cronos"],
  },
});
