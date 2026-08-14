import { defineGame } from "@gamer-cv/core";

export const MonsterHunterWorld = defineGame({
  id: "monster-hunter-world",
  name: "Monster Hunter World",
  publisher: "Capcom",
  genres: ["RPG", "action"],
  icon: "/icons/mhw.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin de l'histoire", "Chasseur Maître", "Tous les monstres", "Iceborne 100%"],
  },
});
