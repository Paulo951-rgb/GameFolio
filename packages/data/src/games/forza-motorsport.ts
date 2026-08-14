import { defineGame } from "@gamer-cv/core";

export const ForzaMotorsport = defineGame({
  id: "forza-motorsport",
  name: "Forza Motorsport",
  publisher: "Xbox Game Studios",
  developer: "Turn 10 Studios",
  genres: ["course", "simulation"],
  aliases: ["forza motorsport", "fm", "forza ms"],
  platforms: ["PC", "Console"],
  releaseYear: 2023,
  icon: "/icons/forza-ms.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Circuit", "Endurance", "Drag", "Drift", "Rallycross"],
  },
});
