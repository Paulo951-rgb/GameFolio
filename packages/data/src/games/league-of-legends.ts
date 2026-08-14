import { defineGame } from "@gamer-cv/core";

export const LeagueOfLegends = defineGame({
  id: "league-of-legends",
  name: "League of Legends",
  publisher: "Riot Games",
  genres: ["MOBA", "compétitif"],
  icon: "/icons/lol.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Fer", "Bronze", "Argent", "Or", "Platine", "Émeraude", "Diamant", "Maître", "Grand Maître", "Challenger"],
    roles: ["Top", "Jungle", "Mid", "ADC", "Support"],
    characters: ["Ahri", "Yasuo", "Lee Sin", "Jinx", "Thresh", "Zed", "Lux", "Akali"],
  },
});
