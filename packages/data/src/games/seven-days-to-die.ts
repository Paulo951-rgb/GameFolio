import { defineGame } from "@gamer-cv/core";

export const SevenDaysToDie = defineGame({
  id: "seven-days-to-die",
  name: "7 Days to Die",
  publisher: "The Fun Pimps",
  developer: "The Fun Pimps",
  genres: ["survival", "zombie", "sandbox"],
  aliases: ["7d2d", "7 days", "7 days to die", "seven days"],
  platforms: ["PC", "Console"],
  releaseYear: 2013,
  icon: "/icons/7d2d.svg",
  modules: ["survival", "building"],
  gameData: {
    survivalFocus: ["Base building", "Horde night", "Crafting", "Loot", "PvE", "Coop"],
  },
});
