import { defineGame } from "@gamer-cv/core";

export const Cyberpunk2077 = defineGame({
  id: "cyberpunk-2077",
  name: "Cyberpunk 2077",
  publisher: "CD Projekt Red",
  genres: ["RPG", "action", "open world"],
  icon: "/icons/cyberpunk.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Fin principale", "Phantom Liberty 100%", "Toutes les quêtes secondaires", "Très dur"],
  },
});
