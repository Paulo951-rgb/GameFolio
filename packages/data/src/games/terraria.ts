import { defineGame } from "@gamer-cv/core";

export const Terraria = defineGame({
  id: "terraria",
  name: "Terraria",
  publisher: "Re-Logic",
  developer: "Re-Logic",
  genres: ["sandbox", "survival", "action"],
  aliases: ["terraria", "teraria"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 2011,
  icon: "/icons/terraria.svg",
  modules: ["sandbox", "survival", "building"],
  gameData: {
    gameModes: ["Classique", "Expert", "Maître", "Légende", "Journey"],
  },
});
