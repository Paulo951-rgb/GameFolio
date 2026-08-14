import { defineGame } from "@gamer-cv/core";

export const PUBG = defineGame({
  id: "pubg",
  name: "PUBG: Battlegrounds",
  publisher: "Krafton",
  developer: "PUBG Studios",
  genres: ["battle royale", "FPS"],
  aliases: ["pubg", "playerunknown", "battlegrounds"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 2017,
  icon: "/icons/pubg.svg",
  modules: ["battleroyale", "weaponbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Conquérant"],
    roles: [],
    characters: [],
    weapons: ["M416", "AKM", "SCAR-L", "Beryl M762", "Kar98k", "AWM", "M24", "UMP45", "DP-28"],
  },
});
