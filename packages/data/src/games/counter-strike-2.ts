import { defineGame } from "@gamer-cv/core";

export const CounterStrike2 = defineGame({
  id: "counter-strike-2",
  name: "Counter-Strike 2",
  publisher: "Valve",
  developer: "Valve",
  genres: ["FPS", "tactique", "compétitif"],
  aliases: ["cs2", "csgo", "counter strike", "cs"],
  platforms: ["PC"],
  releaseYear: 2023,
  icon: "/icons/cs2.svg",
  modules: ["competitive", "weaponbased"],
  gameData: {
    ranks: ["Argent", "Nova", "Garde", "Maitre-Garde", "Distinguished", "Légende", "Maître Légende", "Elite mondiale", "Premier"],
    roles: ["Entry Fragger", "AWPer", "IGL", "Support", "Lurker", "Rifler"],
    characters: [],
    weapons: ["USP-S", "Glock-18", "Deagle", "P250", "Five-SeveN", "Tec-9", "MP9", "MAC-10", "UMP-45", "Nova", "XM1014", "Galil", "FAMAS", "AK-47", "M4A1-S", "M4A4", "SSG 08", "AUG", "SG 553", "AWP", "Scout", "M249", "Negev"],
  },
});
