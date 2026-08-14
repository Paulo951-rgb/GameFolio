import { defineGame } from "@gamer-cv/core";

export const EldenRing = defineGame({
  id: "elden-ring",
  name: "Elden Ring",
  publisher: "FromSoftware",
  genres: ["RPG", "action", "souls-like"],
  icon: "/icons/elden-ring.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin d'Elden Seigneur", "Tous les boss", "Toutes les cendres", "NG+7"],
  },
});
