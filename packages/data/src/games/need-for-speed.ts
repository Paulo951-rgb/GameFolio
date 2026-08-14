import { defineGame } from "@gamer-cv/core";

export const NeedForSpeed = defineGame({
  id: "need-for-speed",
  name: "Need for Speed (série)",
  publisher: "EA",
  developer: "Criterion / Ghost Games",
  genres: ["course", "arcade"],
  aliases: ["nfs", "need for speed", "need for speed most wanted"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 1994,
  icon: "/icons/nfs.svg",
  modules: ["racing"],
  gameData: {
    disciplines: ["Street", "Circuit", "Drag", "Drift", "Pursuite"],
  },
});
