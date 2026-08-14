import { defineGame } from "@gamer-cv/core";

export const Rust = defineGame({
  id: "rust",
  name: "Rust",
  publisher: "Facepunch Studios",
  genres: ["sandbox", "survival", "pvp"],
  icon: "/icons/rust.svg",
  modules: ["sandbox"],
  gameData: {
    gameModes: ["Solo", "Duo", "Trio", "Wipe", "Modded"],
  },
});
