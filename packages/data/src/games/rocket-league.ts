import { defineGame } from "@gamer-cv/core";

export const RocketLeague = defineGame({
  id: "rocket-league",
  name: "Rocket League",
  publisher: "Psyonix",
  developer: "Psyonix",
  genres: ["sport", "compétitif", "course"],
  aliases: ["rl", "rocket", "roquet league"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 2015,
  icon: "/icons/rocket-league.svg",
  modules: ["competitive", "sports"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Champion", "Grand Champion", "SSL"],
    roles: ["Attaquant", "Milieu", "Défenseur", "Goal"],
    characters: [],
    modes: ["Solo Duel", "Doubles", "Standard", "Solo Standard", "Rumble", "Dropshot", "Hoops", "Snow Day"],
  },
});
