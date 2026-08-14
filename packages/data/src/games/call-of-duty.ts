import { defineGame } from "@gamer-cv/core";

export const CallOfDuty = defineGame({
  id: "call-of-duty",
  name: "Call of Duty (série Multiplayer)",
  publisher: "Activision",
  developer: "Infinity Ward / Treyarch / Sledgehammer",
  genres: ["FPS", "compétitif"],
  aliases: ["cod", "call of duty", "cod mp"],
  platforms: ["PC", "Console"],
  releaseYear: 2003,
  icon: "/icons/cod.svg",
  modules: ["competitive", "weaponbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Crimson", "Iridescence", "Top 500"],
    roles: ["Slayer", "SMG", "AR", "Support", "Sniper", "Objective"],
    characters: [],
    weapons: ["AK-47", "M4", "MP5", "Kilo 141", "Grau", "AMAX", "HDR", "AX-50", "Kar98k", "MAC-10"],
  },
});
