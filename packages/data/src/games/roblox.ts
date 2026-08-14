import { defineGame } from "@gamer-cv/core";

export const Roblox = defineGame({
  id: "roblox",
  name: "Roblox",
  publisher: "Roblox Corporation",
  developer: "Roblox Corporation",
  genres: ["sandbox", "créatif", "plateforme"],
  aliases: ["roblox", "roblocks", "roblex"],
  platforms: ["PC", "Mobile", "Console"],
  releaseYear: 2006,
  icon: "/icons/roblox.svg",
  modules: ["creative", "contentcreator", "serveradmin"],
  gameData: {
    gameModes: ["Obby", "Tycoon", "RP", "Simulator", "FPS", "Horror", "PvP"],
    buildTools: ["Roblox Studio", "Luau"],
  },
});
