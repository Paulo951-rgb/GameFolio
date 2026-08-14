import { defineGame } from "@gamer-cv/core";

export const Trackmania = defineGame({
  id: "trackmania",
  name: "Trackmania",
  publisher: "Ubisoft",
  genres: ["course", "arcade"],
  icon: "/icons/trackmania.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Cup of the Day", "Rangé", "Stade", "Côte"],
  },
});
