import { defineGame } from "@gamer-cv/core";

export const Terraria = defineGame({
  id: "terraria",
  name: "Terraria",
  publisher: "Re-Logic",
  genres: ["sandbox", "survival"],
  icon: "/icons/terraria.svg",
  modules: ["sandbox"],
  gameData: {
    gameModes: ["Classique", "Expert", "Maître", "Légende", "Journey"],
  },
});
