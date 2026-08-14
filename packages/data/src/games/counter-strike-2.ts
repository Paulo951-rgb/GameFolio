import { defineGame } from "@gamer-cv/core";

export const CounterStrike2 = defineGame({
  id: "counter-strike-2",
  name: "Counter-Strike 2",
  publisher: "Valve",
  genres: ["FPS", "tactique"],
  icon: "/icons/cs2.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Argent", "Nova", "Garde", "Maitre-Garde", "Distinguished", "Légende", "Maître Légende", "Elite mondiale"],
    roles: ["Entry Fragger", "AWPer", "IGL", "Support", "Lurker"],
    characters: [],
  },
});
