import { defineGame } from "@gamer-cv/core";

export const HollowKnight = defineGame({
  id: "hollow-knight",
  name: "Hollow Knight",
  publisher: "Team Cherry",
  genres: ["metroidvania", "indie"],
  platforms: ["PC", "Console"],
  icon: "/icons/hollow-knight.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin 100%", "Mode Acier", "Pantheons", "Toutes les chauve-souris"],
  },
});
