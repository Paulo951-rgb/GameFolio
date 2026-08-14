import { defineGame } from "@gamer-cv/core";

export const Arknights = defineGame({
  id: "arknights",
  name: "Arknights",
  publisher: "Yostar",
  genres: ["gacha", "tactique"],
  icon: "/icons/arknights.svg",
  modules: ["gacha"],
  gameData: {
    units: ["6★ SilverAsh", "6★ Exusiai", "6★ Saria", "6★ Eyjafjalla", "6★ Surtr"],
  },
});
