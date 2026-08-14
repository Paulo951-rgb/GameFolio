import { defineGame } from "@gamer-cv/core";

/** Fortnite — battle royale (no competitive ranked ladder in this module set). */
export const Fortnite = defineGame({
  id: "fortnite",
  name: "Fortnite",
  publisher: "Epic Games",
  genres: ["battle royale", "survival"],
  icon: "/icons/fortnite.svg",
  modules: ["battleroyale"],
  gameData: {
    ranks: [],
  },
});
