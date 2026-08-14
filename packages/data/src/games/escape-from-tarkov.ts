import { defineGame } from "@gamer-cv/core";

export const EscapeFromTarkov = defineGame({
  id: "escape-from-tarkov",
  name: "Escape from Tarkov",
  publisher: "Battlestate Games",
  developer: "Battlestate Games",
  genres: ["FPS", "survival", "tactique", "extraction"],
  aliases: ["eft", "tarkov", "escape from tarkov"],
  platforms: ["PC"],
  releaseYear: 2017,
  icon: "/icons/tarkov.svg",
  modules: ["weaponbased", "survival"],
  gameData: {
    ranks: [],
    roles: ["PMC USEC", "PMC BEAR", "Scav"],
    characters: [],
    weapons: ["M4A1", "AK-74M", "HK 416", "ADAR 2-15", "VDV Mangler", "MP5", "Saiga-12", "Mosin"],
  },
});
