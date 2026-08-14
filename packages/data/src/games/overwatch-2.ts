import { defineGame } from "@gamer-cv/core";

export const Overwatch2 = defineGame({
  id: "overwatch-2",
  name: "Overwatch 2",
  publisher: "Blizzard",
  genres: ["FPS", "compétitif"],
  icon: "/icons/ow2.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Grand Maître", "Top 500"],
    roles: ["Tank", "DPS", "Support"],
    characters: ["Tracer", "Reinhardt", "Mercy", "Genji", "Ana", "Winston"],
  },
});
