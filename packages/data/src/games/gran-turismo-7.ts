import { defineGame } from "@gamer-cv/core";

export const GranTurismo7 = defineGame({
  id: "gran-turismo-7",
  name: "Gran Turismo 7",
  publisher: "Sony Interactive Entertainment",
  developer: "Polyphony Digital",
  genres: ["course", "simulation"],
  aliases: ["gt7", "gran turismo", "gt"],
  platforms: ["Console"],
  releaseYear: 2022,
  icon: "/icons/gt7.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Circuit", "Rallye", "Endurance", "Kart", "Vision GT"],
  },
});
