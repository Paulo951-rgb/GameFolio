import { defineGame } from "@gamer-cv/core";

export const WorldOfWarcraft = defineGame({
  id: "world-of-warcraft",
  name: "World of Warcraft",
  publisher: "Blizzard",
  genres: ["MMORPG", "mmo"],
  platforms: ["PC"],
  icon: "/icons/wow.svg",
  modules: ["progression", "clan"],
  gameData: {
    ranks: ["Normal", "Héroïque", "Mythique"],
    arenas: ["Donjon", "Raid", "Mythique+", "JcJ"],
    clanRoles: ["Membre", "Initié", "Vétéran", "Officier", "Maître de guilde"],
  },
});
