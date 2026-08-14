import { defineGame } from "@gamer-cv/core";

export const FinalFantasyXIV = defineGame({
  id: "final-fantasy-xiv",
  name: "Final Fantasy XIV",
  publisher: "Square Enix",
  genres: ["MMORPG", "mmo"],
  icon: "/icons/ffxiv.svg",
  modules: ["progression", "clan"],
  gameData: {
    ranks: ["Normal", "Extrême", "Mortel", "Innombrable", "Ultime"],
    arenas: ["Donjon", "Raid 8", "Alliance 24", "Ultime", "Eureka"],
    clanRoles: ["Membre", "Officier", "Maître de compagnie"],
  },
});
