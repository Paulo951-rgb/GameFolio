import { defineGame } from "@gamer-cv/core";

export const CounterStrikeGO = defineGame({
  id: "counter-strike-global-offensive",
  name: "Counter-Strike: Global Offensive",
  publisher: "Valve",
  developer: "Valve",
  genres: ["FPS", "tactique", "compétitif"],
  aliases: ["csgo", "cs go", "global offensive"],
  platforms: ["PC"],
  releaseYear: 2012,
  icon: "/icons/csgo.svg",
  modules: ["competitive", "weaponbased"],
  gameData: {
    ranks: ["Argent", "Nova", "Garde", "Maitre-Garde", "Distinguished", "Légende", "Maître Légende", "Elite mondiale"],
    roles: ["Entry Fragger", "AWPer", "IGL", "Support", "Lurker", "Rifler"],
    characters: [],
    weapons: ["USP-S", "Glock-18", "Deagle", "AK-47", "M4A1-S", "M4A4", "AWP", "MP9", "MAC-10", "Nova"],
  },
});
