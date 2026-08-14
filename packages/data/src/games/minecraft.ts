import { defineGame } from "@gamer-cv/core";

export const Minecraft = defineGame({
  id: "minecraft",
  name: "Minecraft",
  publisher: "Mojang",
  genres: ["sandbox", "survival"],
  icon: "/icons/minecraft.svg",
  modules: ["sandbox"],
  gameData: {
    gameModes: ["Survie", "Créatif", "Hardcore", "PvP", "Modding"],
  },
});
