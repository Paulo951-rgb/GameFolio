import { defineGame } from "@gamer-cv/core";

export const ForzaHorizon5 = defineGame({
  id: "forza-horizon-5",
  name: "Forza Horizon 5",
  publisher: "Playground Games",
  genres: ["course", "open world"],
  icon: "/icons/forza.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Route", "Tout-terrain", "Cross Country", "Rallye", "Drag"],
  },
});
