import { defineGame } from "@gamer-cv/core";

export const ForzaHorizon5 = defineGame({
  id: "forza-horizon-5",
  name: "Forza Horizon 5",
  publisher: "Xbox Game Studios",
  developer: "Playground Games",
  genres: ["course", "open world", "arcade"],
  aliases: ["forza horizon", "fh5", "fh"],
  platforms: ["PC", "Console"],
  releaseYear: 2021,
  icon: "/icons/forza.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Route", "Tout-terrain", "Cross Country", "Rallye", "Drag"],
  },
});
