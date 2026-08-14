import { defineGame } from "@gamer-cv/core";

export const EldenRing = defineGame({
  id: "elden-ring",
  name: "Elden Ring",
  publisher: "Bandai Namco",
  developer: "FromSoftware",
  genres: ["RPG", "action", "souls-like", "open-world"],
  aliases: ["elden", "elden ring", "fromsoftware", "sous-like", "souls"],
  platforms: ["PC", "Console"],
  releaseYear: 2022,
  icon: "/icons/elden-ring.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin d'Elden Seigneur", "Tous les boss", "Toutes les cendres", "NG+7", "Tous les donjons"],
  },
});
