import { defineGame } from "@gamer-cv/core";

export const BaldursGate3 = defineGame({
  id: "baldurs-gate-3",
  name: "Baldur's Gate 3",
  publisher: "Larian Studios",
  genres: ["RPG", "tactique"],
  icon: "/icons/bg3.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin principale", "Honoraire", "Toutes les compagnons", "Difficulté tacticien"],
  },
});
