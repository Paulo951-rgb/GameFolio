import { defineGame } from "@gamer-cv/core";

export const Dota2 = defineGame({
  id: "dota-2",
  name: "Dota 2",
  publisher: "Valve",
  genres: ["MOBA", "compétitif"],
  icon: "/icons/dota2.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"],
    roles: ["Carry", "Mid", "Offlane", "Support", "Hard Support"],
    characters: ["Pudge", "Invoker", "Juggernaut", "Crystal Maiden", "Lina", "Spectre"],
  },
});
