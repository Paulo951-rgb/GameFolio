import { defineGame } from "@gamer-cv/core";

export const LeagueOfLegendsWildRift = defineGame({
  id: "wild-rift",
  name: "League of Legends: Wild Rift",
  publisher: "Riot Games",
  developer: "Riot Games",
  genres: ["MOBA", "mobile", "compétitif"],
  aliases: ["wild rift", "wr", "lol wr", "lol mobile"],
  platforms: ["Mobile", "Console"],
  releaseYear: 2020,
  icon: "/icons/wildrift.svg",
  modules: ["competitive", "moba", "characterbased"],
  gameData: {
    ranks: ["Fer", "Bronze", "Argent", "Or", "Platine", "Émeraude", "Diamant", "Maître", "Grand Maître", "Challenger"],
    roles: ["Baron", "Jungle", "Mid", "Dragon", "Support"],
    characters: ["Ahri", "Yasuo", "Jinx", "Blitzcrank", "Lux", "Akali", "Jhin", "Seraphine", "Katarina", "Wukong"],
  },
});
