import { defineGame } from "@gamer-cv/core";

export const PUBGMobile = defineGame({
  id: "pubg-mobile",
  name: "PUBG Mobile",
  publisher: "Krafton",
  developer: "Lightspeed & Quantum",
  genres: ["battle royale", "mobile", "FPS"],
  aliases: ["pubg mobile", "pubgm", "pubg m"],
  platforms: ["Mobile"],
  releaseYear: 2018,
  icon: "/icons/pubgm.svg",
  modules: ["battleroyale", "weaponbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Couronne", "Ace", "Conquérant"],
    roles: [],
    characters: [],
    weapons: ["M416", "AKM", "SCAR-L", "Kar98k", "AWM", "UMP45"],
  },
});
