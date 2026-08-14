import { defineGame } from "@gamer-cv/core";

export const ARKSurvivalEvolved = defineGame({
  id: "ark-survival-evolved",
  name: "ARK: Survival Evolved",
  publisher: "Studio Wildcard",
  developer: "Studio Wildcard",
  genres: ["survival", "sandbox", "open-world"],
  aliases: ["ark", "ark se", "ark survival"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 2017,
  icon: "/icons/ark.svg",
  modules: ["survival", "building", "serveradmin"],
  gameData: {
    survivalFocus: ["Taming", "Base building", "PvE", "PvP", "Bosses", "Breeding", "Exploration"],
  },
});
