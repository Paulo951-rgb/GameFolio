import { defineGame } from "@gamer-cv/core";

export const AmongUs = defineGame({
  id: "among-us",
  name: "Among Us",
  publisher: "Innersloth",
  genres: ["social", "multi"],
  icon: "/icons/among-us.svg",
  modules: ["sandbox"],
  gameData: {
    gameModes: ["Crewmate", "Imposteur", "Cache-cache", "Zombie"],
  },
});
