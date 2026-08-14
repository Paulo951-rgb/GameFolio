import { defineGame } from "@gamer-cv/core";

export const Minecraft = defineGame({
  id: "minecraft",
  name: "Minecraft",
  publisher: "Mojang",
  developer: "Mojang",
  genres: ["sandbox", "survival", "créatif"],
  aliases: ["mc", "minecaft", "jeu de blocs"],
  platforms: ["PC", "Mobile", "Console"],
  releaseYear: 2011,
  icon: "/icons/minecraft.svg",
  modules: ["sandbox", "building", "redstone", "modding", "serveradmin", "creative"],
  gameData: {
    gameModes: ["Survie", "Créatif", "Hardcore", "PvP", "Modding", "Aventure", "Skyblock"],
    buildSpecialties: ["Médiéval", "Moderne", "Fantasy", "Organique", "Pixel art", "Terraforming", "Steampunk"],
    buildTools: ["WorldEdit", "VoxelSniper", "GoBrush", "Blockbench"],
  },
});
