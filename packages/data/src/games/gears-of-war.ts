import { defineGame } from "@gamer-cv/core";

export const Gears = defineGame({
  id: "gears-of-war",
  name: "Gears of War (série)",
  publisher: "Xbox Game Studios",
  developer: "The Coalition",
  genres: ["TPS", "action", "compétitif"],
  aliases: ["gears", "gears of war", "gow"],
  platforms: ["PC", "Console"],
  releaseYear: 2006,
  icon: "/icons/gears.svg",
  modules: ["competitive", "weaponbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Onyx"],
    roles: ["Slayer", "Objective", "Support"],
    characters: [],
    weapons: ["Lancer", "Gnasher", "Hammerburst", "Sniper", "Boltok", "Mulcher"],
  },
});
