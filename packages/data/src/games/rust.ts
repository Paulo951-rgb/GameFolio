import { defineGame } from "@gamer-cv/core";

export const Rust = defineGame({
  id: "rust",
  name: "Rust",
  publisher: "Facepunch Studios",
  developer: "Facepunch Studios",
  genres: ["sandbox", "survival", "pvp"],
  aliases: ["rust", "rust pvp"],
  platforms: ["PC", "Console"],
  releaseYear: 2018,
  icon: "/icons/rust.svg",
  modules: ["survival", "serveradmin"],
  gameData: {
    gameModes: ["Solo", "Duo", "Trio", "Wipe", "Modded"],
    survivalFocus: ["Base building", "PvP", "Raiding", "Farming", "Coop"],
  },
});
