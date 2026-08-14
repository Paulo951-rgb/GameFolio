import { defineGame } from "@gamer-cv/core";

/** Genshin Impact — gacha collection + open-world single-player. */
export const GenshinImpact = defineGame({
  id: "genshin-impact",
  name: "Genshin Impact",
  publisher: "HoYoverse",
  developer: "miHoYo",
  genres: ["RPG", "gacha", "open world"],
  aliases: ["genshin", "genshin impact", "gensin"],
  platforms: ["PC", "Mobile", "Console"],
  releaseYear: 2020,
  icon: "/icons/genshin.svg",
  modules: ["gacha", "completion"],
  gameData: {
    units: ["5★ Diluc", "5★ Hu Tao", "5★ Raiden", "5★ Zhongli", "5★ Ayaka", "5★ Nahida", "5★ Furina", "5★ Neuvillette", "5★ Kazuha", "5★ Yelan"],
  },
});
