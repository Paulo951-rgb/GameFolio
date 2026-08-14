import { defineGame } from "@gamer-cv/core";

export const GhostOfTsushima = defineGame({
  id: "ghost-of-tsushima",
  name: "Ghost of Tsushima",
  publisher: "Sony Interactive Entertainment",
  developer: "Sucker Punch Productions",
  genres: ["action", "aventure", "open-world"],
  aliases: ["ghost", "ghost of tsushima", "got", "tsushima"],
  platforms: ["PC", "Console"],
  releaseYear: 2020,
  icon: "/icons/ghost.svg",
  modules: ["completion", "achievement"],
  gameData: {
    trophies: ["Fin de l'histoire", "Tous les haikus", "Tous les renards", "100%", "Lethal"],
  },
});
