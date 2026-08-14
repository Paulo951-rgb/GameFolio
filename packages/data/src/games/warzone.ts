import { defineGame } from "@gamer-cv/core";

export const CallOfDutyWarzone = defineGame({
  id: "warzone",
  name: "Call of Duty: Warzone",
  publisher: "Activision",
  developer: "Infinity Ward / Raven Software",
  genres: ["FPS", "battle royale"],
  aliases: ["wz", "warzone", "call of duty warzone"],
  platforms: ["PC", "Console"],
  releaseYear: 2020,
  icon: "/icons/warzone.svg",
  modules: ["battleroyale", "competitive"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Crimson", "Iridescent", "Top 500"],
    roles: ["Assaut", "Sniper", "Support", "Recon"],
  },
});
