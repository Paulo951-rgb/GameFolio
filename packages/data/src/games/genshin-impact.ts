import { defineGame } from "@gamer-cv/core";

/** Genshin Impact — gacha collection module. */
export const GenshinImpact = defineGame({
  id: "genshin-impact",
  name: "Genshin Impact",
  publisher: "HoYoverse",
  genres: ["RPG", "gacha", "open world"],
  icon: "/icons/genshin.svg",
  modules: ["gacha", "singleplayer"],
  gameData: {
    units: ["5★ Diluc", "5★ Hu Tao", "5★ Raiden", "5★ Zhongli", "5★ Ayaka", "5★ Nahida"],
  },
});
