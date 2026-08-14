import { defineGame } from "@gamer-cv/core";

export const MarioKart8 = defineGame({
  id: "mario-kart-8",
  name: "Mario Kart 8 Deluxe",
  publisher: "Nintendo",
  genres: ["course", "arcade"],
  icon: "/icons/mk8.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["50cc", "100cc", "150cc", "200cc", "Miroir", "Frénésie"],
  },
});
