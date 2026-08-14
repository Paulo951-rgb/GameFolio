import { defineGame } from "@gamer-cv/core";

/** Fortnite — battle royale + creative. Single game spans PC/console/mobile. */
export const Fortnite = defineGame({
  id: "fortnite",
  name: "Fortnite",
  publisher: "Epic Games",
  developer: "Epic Games",
  genres: ["battle royale", "survival", "créatif"],
  aliases: ["fn", "fortnite battle royale", "fortnite creatif"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 2017,
  icon: "/icons/fortnite.svg",
  modules: ["battleroyale", "creative", "contentcreator"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Élite", "Champion", "Unreal"],
  },
});
