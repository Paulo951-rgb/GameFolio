import { defineGame } from "@gamer-cv/core";

export const Skyrim = defineGame({
  id: "skyrim",
  name: "The Elder Scrolls V: Skyrim",
  publisher: "Bethesda Softworks",
  developer: "Bethesda Game Studios",
  genres: ["RPG", "action", "open-world"],
  aliases: ["skyrim", "tes5", "elder scrolls", "the elder scrolls v"],
  platforms: ["PC", "Console"],
  releaseYear: 2011,
  icon: "/icons/skyrim.svg",
  modules: ["completion", "achievement", "modding"],
  gameData: {
    trophies: ["Fin de l'histoire principale", "Toutes les guildes", "100%", "Moddé"],
  },
});
