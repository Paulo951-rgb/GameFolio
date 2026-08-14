import { defineGame } from "@gamer-cv/core";

export const PUBG = defineGame({
  id: "pubg",
  name: "PUBG: Battlegrounds",
  publisher: "Krafton",
  genres: ["battle royale", "FPS"],
  icon: "/icons/pubg.svg",
  modules: ["battleroyale"],
  gameData: {
    ranks: [],
  },
});
