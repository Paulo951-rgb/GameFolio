import { defineGame } from "@gamer-cv/core";

export const SeaOfThieves = defineGame({
  id: "sea-of-thieves",
  name: "Sea of Thieves",
  publisher: "Xbox Game Studios",
  developer: "Rare",
  genres: ["aventure", "coop", "open-world", "survival"],
  aliases: ["sot", "sea of thieves", "sea of thief"],
  platforms: ["PC", "Console"],
  releaseYear: 2018,
  icon: "/icons/sot.svg",
  modules: ["completion", "serveradmin"],
  gameData: {
    survivalFocus: ["Équipage", "Batailles navales", "Quêtes", "Fort", "PvP"],
  },
});
