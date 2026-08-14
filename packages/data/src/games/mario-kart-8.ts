import { defineGame } from "@gamer-cv/core";

export const MarioKart8 = defineGame({
  id: "mario-kart-8",
  name: "Mario Kart 8 Deluxe",
  publisher: "Nintendo",
  developer: "Nintendo",
  genres: ["course", "arcade", "party"],
  aliases: ["mk8", "mario kart", "mk8d", "mario kart 8"],
  platforms: ["Console"],
  releaseYear: 2017,
  icon: "/icons/mk8.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["50cc", "100cc", "150cc", "200cc", "Miroir", "Frénésie"],
  },
});
