import { defineGame } from "@gamer-cv/core";

export const CallOfDutyWarzone = defineGame({
  id: "warzone",
  name: "Call of Duty: Warzone",
  publisher: "Activision",
  genres: ["FPS", "battle royale"],
  icon: "/icons/warzone.svg",
  modules: ["battleroyale", "competitive"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Crimson", "Iridescent", "Top 500"],
    roles: ["Assaut", "Sniper", "Support", "Recon"],
    characters: [],
  },
});
