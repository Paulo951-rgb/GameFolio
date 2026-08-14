import { defineGame } from "@gamer-cv/core";

export const StardewValley = defineGame({
  id: "stardew-valley",
  name: "Stardew Valley",
  publisher: "ConcernedApe",
  genres: ["simulation", "indie"],
  platforms: ["PC", "Console", "Mobile"],
  icon: "/icons/stardew.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin de l'année 2", "Perfectionniste", "Caveau", "Tous les cœurs"],
  },
});
