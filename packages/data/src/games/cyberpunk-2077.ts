import { defineGame } from "@gamer-cv/core";

export const Cyberpunk2077 = defineGame({
  id: "cyberpunk-2077",
  name: "Cyberpunk 2077",
  publisher: "CD Projekt Red",
  developer: "CD Projekt Red",
  genres: ["RPG", "action", "open world"],
  aliases: ["cyberpunk", "cp2077", "cyberpunk edgerunners"],
  platforms: ["PC", "Console"],
  releaseYear: 2020,
  icon: "/icons/cyberpunk.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin principale", "Phantom Liberty 100%", "Toutes les quêtes secondaires", "Très dur"],
    classes: ["Solo", "Netrunner", "Ninja", "Technie", "Hybride"],
  },
});
