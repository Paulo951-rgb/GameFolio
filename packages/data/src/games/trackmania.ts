import { defineGame } from "@gamer-cv/core";

export const Trackmania = defineGame({
  id: "trackmania",
  name: "Trackmania",
  publisher: "Ubisoft",
  developer: "Ubisoft Nadeo",
  genres: ["course", "arcade", "compétitif"],
  aliases: ["tm", "trackmania", "tmnf", "tm2020"],
  platforms: ["PC", "Console"],
  releaseYear: 2020,
  icon: "/icons/trackmania.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Cup of the Day", "Rangé", "Stade", "Côte"],
  },
});
