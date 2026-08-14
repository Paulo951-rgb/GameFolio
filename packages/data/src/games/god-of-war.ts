import { defineGame } from "@gamer-cv/core";

export const GodOfWar = defineGame({
  id: "god-of-war",
  name: "God of War (2018 / Ragnarök)",
  publisher: "Sony Interactive Entertainment",
  developer: "Santa Monica Studio",
  genres: ["action", "RPG", "adventure"],
  aliases: ["gow", "god of war", "god of war ragnarok", "ragnarok"],
  platforms: ["PC", "Console"],
  releaseYear: 2018,
  icon: "/icons/gow.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Tous les corbeaux", "Toutes les Valkyries", "Donjon Ivaldi", "Difficulté Dieu"],
  },
});
