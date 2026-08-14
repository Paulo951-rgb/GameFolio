import { defineGame } from "@gamer-cv/core";

export const Valorant = defineGame({
  id: "valorant",
  name: "Valorant",
  publisher: "Riot Games",
  genres: ["FPS", "tactique"],
  icon: "/icons/valorant.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Fer", "Bronze", "Argent", "Or", "Platine", "Diamant", "Ascendant", "Immortel", "Radiant"],
    roles: ["Duelliste", "Initiateur", "Contrôleur", "Sentinelle"],
    characters: ["Jett", "Raze", "Omen", "Sova", "Killjoy", "Sage", "Phoenix", "Reyna"],
  },
});
