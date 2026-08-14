import { defineGame } from "@gamer-cv/core";

export const FallGuys = defineGame({
  id: "fall-guys",
  name: "Fall Guys",
  publisher: "Epic Games",
  developer: "Mediatonic",
  genres: ["battle royale", "party", "plateforme"],
  aliases: ["fall guys", "fallguy", "fall guy"],
  platforms: ["PC", "Console"],
  releaseYear: 2020,
  icon: "/icons/fallguys.svg",
  modules: ["battleroyale"],
  gameData: {
    ranks: [],
  },
});
