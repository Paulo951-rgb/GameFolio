import { defineGame } from "@gamer-cv/core";

export const Valheim = defineGame({
  id: "valheim",
  name: "Valheim",
  publisher: "Coffee Stain Publishing",
  developer: "Iron Gate AB",
  genres: ["survival", "sandbox", "open-world"],
  aliases: ["valheim"],
  platforms: ["PC", "Console"],
  releaseYear: 2021,
  icon: "/icons/valheim.svg",
  modules: ["survival", "building"],
  gameData: {
    survivalFocus: ["Base building", "Bosses", "Exploration", "Crafting", "Coop", "PvP"],
  },
});
