import { defineGame } from "@gamer-cv/core";

export const BrawlStars = defineGame({
  id: "brawl-stars",
  name: "Brawl Stars",
  publisher: "Supercell",
  genres: ["mobile", "compétitif"],
  platforms: ["Mobile"],
  icon: "/icons/brawl-stars.svg",
  modules: ["progression", "competitive"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Diamant", "Maître", "Légende", "Maître Légende"],
    roles: ["Carry", "Support", "Tank", "Contrôle"],
    characters: ["Shelly", "Colt", "Bull", "Spike", "Crow", "Leon"],
  },
});
