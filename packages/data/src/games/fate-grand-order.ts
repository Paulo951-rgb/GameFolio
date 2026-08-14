import { defineGame } from "@gamer-cv/core";

export const FateGrandOrder = defineGame({
  id: "fate-grand-order",
  name: "Fate/Grand Order",
  publisher: "Lasengle",
  genres: ["gacha", "RPG"],
  icon: "/icons/fgo.svg",
  modules: ["gacha"],
  gameData: {
    units: ["SSR Artoria", "SSR Jeanne", "SSR Scáthach", "SSR Gilgamesh", "SSR Skadi"],
  },
});
