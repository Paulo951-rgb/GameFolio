import { defineGame } from "@gamer-cv/core";

export const HorizonZeroDawn = defineGame({
  id: "horizon-zero-dawn",
  name: "Horizon Zero Dawn / Forbidden West",
  publisher: "Sony Interactive Entertainment",
  developer: "Guerrilla Games",
  genres: ["action", "RPG", "open-world"],
  aliases: ["horizon", "hzd", "horizon zero dawn", "horizon forbidden west", "hfw"],
  platforms: ["PC", "Console"],
  releaseYear: 2017,
  icon: "/icons/horizon.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Toutes les machines", "100%", "ULTRA-HARD"],
  },
});
