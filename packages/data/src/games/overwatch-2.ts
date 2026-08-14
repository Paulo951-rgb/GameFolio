import { defineGame } from "@gamer-cv/core";

export const Overwatch2 = defineGame({
  id: "overwatch-2",
  name: "Overwatch 2",
  publisher: "Blizzard",
  developer: "Blizzard",
  genres: ["FPS", "compétitif", "hero shooter"],
  aliases: ["ow2", "overwatch", "ow"],
  platforms: ["PC", "Console"],
  releaseYear: 2022,
  icon: "/icons/ow2.svg",
  modules: ["competitive", "rolebased", "characterbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Grand Maître", "Top 500"],
    roles: ["Tank", "DPS", "Support"],
    characters: ["Tracer", "Reinhardt", "Mercy", "Genji", "Ana", "Winston", "D.Va", "Widowmaker", "Hanzo", "Kiriko", "Sojourn", "Ramattra", "Lifeweaver", "Illari", "Venture", "Juno"],
  },
});
