import { defineGame } from "@gamer-cv/core";

export const GranTurismo7 = defineGame({
  id: "gran-turismo-7",
  name: "Gran Turismo 7",
  publisher: "Polyphony Digital",
  genres: ["course", "simulation"],
  icon: "/icons/gt7.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Circuit", "Rallye", "Endurance", "Kart", "Vision GT"],
  },
});
