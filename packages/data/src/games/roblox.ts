import { defineGame } from "@gamer-cv/core";

export const Roblox = defineGame({
  id: "roblox",
  name: "Roblox",
  publisher: "Roblox Corporation",
  genres: ["sandbox", "plateforme"],
  icon: "/icons/roblox.svg",
  modules: ["sandbox"],
  gameData: {
    gameModes: ["Adopt Me", "Brookhaven", "Tower of Hell", "Arsenal", "Jailbreak"],
  },
});
