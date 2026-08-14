import { defineGame } from "@gamer-cv/core";

export const ProjectZomboid = defineGame({
  id: "project-zomboid",
  name: "Project Zomboid",
  publisher: "The Indie Stone",
  developer: "The Indie Stone",
  genres: ["survival", "zombie", "simulation"],
  aliases: ["zomboid", "project zomboid", "pz"],
  platforms: ["PC"],
  releaseYear: 2013,
  icon: "/icons/zomboid.svg",
  modules: ["survival", "building"],
  gameData: {
    survivalFocus: ["Base building", "Crafting", "Farming", "Loot", "Coop", "PvE"],
  },
});
