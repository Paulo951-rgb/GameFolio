import { defineGame } from "@gamer-cv/core";

export const F1 = defineGame({
  id: "f1",
  name: "F1 (série EA Sports / Codemasters)",
  publisher: "EA",
  developer: "Codemasters",
  genres: ["course", "simulation", "sport"],
  aliases: ["f1", "f1 23", "f1 24", "formula 1"],
  platforms: ["PC", "Console"],
  releaseYear: 2021,
  icon: "/icons/f1.svg",
  modules: ["racing", "competitive"],
  gameData: {
    disciplines: ["Course", "Qualification", "Endurance", "My Team", "Career"],
    ranks: [],
  },
});
