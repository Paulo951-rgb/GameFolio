import { defineGame } from "@gamer-cv/core";

export const BaldursGate3 = defineGame({
  id: "baldurs-gate-3",
  name: "Baldur's Gate 3",
  publisher: "Larian Studios",
  developer: "Larian Studios",
  genres: ["RPG", "tactique", "compagnons"],
  aliases: ["bg3", "baldurs gate 3", "baldur's gate 3"],
  platforms: ["PC", "Console"],
  releaseYear: 2023,
  icon: "/icons/bg3.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin principale", "Honoraire", "Toutes les compagnons", "Difficulté tacticien"],
    classes: ["Barde", "Clerc", "Druide", "Paladin", "Rôdeur", "Sorcier", "Ensorceleur", "Magicien", "Guerrier", "Moine", "Voleur", "Barbare"],
  },
});
