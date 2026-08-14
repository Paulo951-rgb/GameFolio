import { defineGame } from "@gamer-cv/core";

export const LeagueOfLegends = defineGame({
  id: "league-of-legends",
  name: "League of Legends",
  publisher: "Riot Games",
  developer: "Riot Games",
  genres: ["MOBA", "compétitif"],
  aliases: ["lol", "league", "leage of legends"],
  platforms: ["PC"],
  releaseYear: 2009,
  icon: "/icons/lol.svg",
  modules: ["competitive", "moba", "characterbased"],
  gameData: {
    ranks: ["Fer", "Bronze", "Argent", "Or", "Platine", "Émeraude", "Diamant", "Maître", "Grand Maître", "Challenger"],
    roles: ["Top", "Jungle", "Mid", "ADC", "Support"],
    characters: ["Ahri", "Yasuo", "Lee Sin", "Jinx", "Thresh", "Zed", "Lux", "Akali", "Garen", "Darius", "Katarina", "Ezreal", "Jhin", "Sett", "Yone", "Viego", "K'Sante", "Aurora", "Smolder"],
  },
});
