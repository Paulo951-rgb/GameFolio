import { defineGame } from "@gamer-cv/core";

export const AmongUs = defineGame({
  id: "among-us",
  name: "Among Us",
  publisher: "Innersloth",
  developer: "Innersloth",
  genres: ["social", "multi"],
  aliases: ["among us", "amogus"],
  platforms: ["PC", "Console", "Mobile"],
  icon: "/icons/among-us.svg",
  modules: ["sandbox"],
  gameData: {
    gameModes: ["Crewmate", "Imposteur", "Cache-cache", "Zombie"],
  },
});
