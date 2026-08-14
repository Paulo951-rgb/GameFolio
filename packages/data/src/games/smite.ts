import { defineGame } from "@gamer-cv/core";

export const Smite = defineGame({
  id: "smite",
  name: "SMITE",
  publisher: "Hi-Rez Studios",
  developer: "Titan Forge Games",
  genres: ["MOBA", "compétitif"],
  aliases: ["smite"],
  platforms: ["PC", "Console"],
  releaseYear: 2014,
  icon: "/icons/smite.svg",
  modules: ["competitive", "moba", "characterbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Grand Maître", "Diamond"],
    roles: ["Solo", "Jungle", "Mid", "ADC", "Support"],
    characters: ["Zeus", "Loki", "Thor", "Athena", "Anubis", "Ra", "Kukulkan", "Bakasura", "Merlin", "King Arthur"],
  },
});
