import { defineGame } from "@gamer-cv/core";

export const MonsterHunterWorld = defineGame({
  id: "monster-hunter-world",
  name: "Monster Hunter: World",
  publisher: "Capcom",
  developer: "Capcom",
  genres: ["RPG", "action", "coop"],
  aliases: ["mhw", "monster hunter", "monster hunter world"],
  platforms: ["PC", "Console"],
  releaseYear: 2018,
  icon: "/icons/mhw.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Chasseur Maître", "Tous les monstres", "Iceborne 100%"],
    roles: ["Lame", "Marteau", "Fusarbalette", "Hache-fusil", "Lance-canons", "Insectoglaive", "Corne de chasse"],
  },
});
