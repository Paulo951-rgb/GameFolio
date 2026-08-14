import { defineGame } from "@gamer-cv/core";

/**
 * Clash of Clans composes progression + clan — exercises multi-module composition
 * (the composite schema merges both modules' shapes with no key collisions).
 */
export const ClashOfClans = defineGame({
  id: "clash-of-clans",
  name: "Clash of Clans",
  publisher: "Supercell",
  genres: ["mobile", "stratégie"],
  icon: "/icons/coc.svg",
  modules: ["progression", "clan"],
  gameData: {
    ranks: ["Ligue de bronze", "Ligue d'argent", "Ligue d'or", "Ligue de cristal", "Ligue du maître", "Ligue des champions", "Ligue titan", "Ligue légende"],
    arenas: ["Hôtel de ville 1", "Hôtel de ville 5", "Hôtel de ville 10", "Hôtel de ville 14", "Hôtel de ville 16"],
    clanRoles: ["Membre", "Aîné", "Chef adjoint", "Chef"],
  },
});
