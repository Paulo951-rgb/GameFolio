import { defineGame } from "@gamer-cv/core";

export const DarkSouls = defineGame({
  id: "dark-souls",
  name: "Dark Souls (série)",
  publisher: "Bandai Namco",
  developer: "FromSoftware",
  genres: ["RPG", "action", "souls-like"],
  aliases: ["ds", "dark souls", "dark souls 3", "ds3", "darksouls"],
  platforms: ["PC", "Console"],
  releaseYear: 2011,
  icon: "/icons/ds.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin du jeu", "Tous les boss", "Toutes les armes", "NG+7", "SL1 run"],
  },
});
