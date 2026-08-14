import { defineGame } from "@gamer-cv/core";

export const LeagueOfLegendsWildRift = defineGame({
  id: "wild-rift",
  name: "League of Legends: Wild Rift",
  publisher: "Riot Games",
  genres: ["MOBA", "mobile"],
  icon: "/icons/wildrift.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Fer", "Bronze", "Argent", "Or", "Platine", "Émeraude", "Diamant", "Maître", "Grand Maître", "Challenger"],
    roles: ["Baron", "Jungle", "Mid", "Dragon", "Support"],
    characters: ["Ahri", "Yasuo", "Jinx", "Blitzcrank", "Lux", "Akali"],
  },
});
