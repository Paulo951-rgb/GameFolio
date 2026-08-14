import { defineGame } from "@gamer-cv/core";

export const RocketLeague = defineGame({
  id: "rocket-league",
  name: "Rocket League",
  publisher: "Psyonix",
  genres: ["sport", "compétitif"],
  icon: "/icons/rocket-league.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Champion", "Grand Champion", "SSL"],
    roles: ["Attaquant", "Milieu", "Défenseur", "Goal"],
    characters: [],
  },
});
