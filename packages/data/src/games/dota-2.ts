import { defineGame } from "@gamer-cv/core";

export const Dota2 = defineGame({
  id: "dota-2",
  name: "Dota 2",
  publisher: "Valve",
  developer: "Valve",
  genres: ["MOBA", "compétitif"],
  aliases: ["dota", "dota2", "defense of the ancients"],
  platforms: ["PC"],
  releaseYear: 2013,
  icon: "/icons/dota2.svg",
  modules: ["competitive", "moba", "characterbased"],
  gameData: {
    ranks: ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"],
    roles: ["Carry", "Mid", "Offlane", "Support", "Hard Support"],
    characters: ["Pudge", "Invoker", "Juggernaut", "Crystal Maiden", "Lina", "Spectre", "Phantom Assassin", "Anti-Mage", "Tinker", "Storm Spirit", "Ember Spirit", "Mars"],
  },
});
