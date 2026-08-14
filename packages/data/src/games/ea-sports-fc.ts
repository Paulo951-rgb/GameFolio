import { defineGame } from "@gamer-cv/core";

export const FIFA = defineGame({
  id: "ea-sports-fc",
  name: "EA SPORTS FC",
  publisher: "EA Sports",
  genres: ["sport", "compétitif"],
  icon: "/icons/fc.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Div 10", "Div 8", "Div 6", "Div 4", "Div 2", "Div 1", "Elite"],
    roles: ["Gardien", "Défenseur", "Milieu", "Attaquant"],
    characters: [],
  },
});
