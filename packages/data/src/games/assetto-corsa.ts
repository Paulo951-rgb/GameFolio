import { defineGame } from "@gamer-cv/core";

export const AssettoCorsa = defineGame({
  id: "assetto-corsa",
  name: "Assetto Corsa / Competizione",
  publisher: "505 Games / Kunos Simulazioni",
  developer: "Kunos Simulazioni",
  genres: ["course", "simulation"],
  aliases: ["ac", "assetto", "acc", "assetto corsa competizione"],
  platforms: ["PC", "Console"],
  releaseYear: 2014,
  icon: "/icons/acc.svg",
  modules: ["racing", "competitive"],
  gameData: {
    disciplines: ["Circuit", "Endurance", "GT3", "GT4", "Rally"],
  },
});
