import { defineGame } from "@gamer-cv/core";

export const CallOfDutyMobile = defineGame({
  id: "call-of-duty-mobile",
  name: "Call of Duty: Mobile",
  publisher: "Activision",
  developer: "TiMi Studio Group",
  genres: ["FPS", "mobile", "compétitif", "battle royale"],
  aliases: ["codm", "cod mobile", "call of duty mobile"],
  platforms: ["Mobile"],
  releaseYear: 2019,
  icon: "/icons/codm.svg",
  modules: ["competitive", "weaponbased", "battleroyale"],
  gameData: {
    ranks: ["Rookie", "Veteran", "Elite", "Pro", "Master", "Grandmaster", "Legendary", "Mythic"],
    roles: ["Slayer", "Objective", "Sniper", "Support"],
    characters: [],
    weapons: ["AK-47", "M4", "DL Q33", "Arctic .50", "QQ9", "Fennec", "Kilo 141"],
  },
});
