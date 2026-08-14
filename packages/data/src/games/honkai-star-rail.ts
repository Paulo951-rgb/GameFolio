import { defineGame } from "@gamer-cv/core";

export const HonkaiStarRail = defineGame({
  id: "honkai-star-rail",
  name: "Honkai: Star Rail",
  publisher: "HoYoverse",
  genres: ["RPG", "gacha", "tactique"],
  icon: "/icons/hsr.svg",
  modules: ["gacha", "singleplayer"],
  gameData: {
    units: ["5★ Kafka", "5★ Jing Yuan", "5★ Seele", "5★ Luocha", "5★ Silver Wolf"],
  },
});
