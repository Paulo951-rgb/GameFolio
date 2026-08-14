import { defineGame } from "@gamer-cv/core";

/** Clash Royale composes progression + clan (multi-module, like CoC). */
export const ClashRoyale = defineGame({
  id: "clash-royale",
  name: "Clash Royale",
  publisher: "Supercell",
  genres: ["mobile", "stratégie"],
  platforms: ["Mobile"],
  icon: "/icons/cr.svg",
  modules: ["progression", "clan"],
  gameData: {
    ranks: ["Arène 1", "Arène 5", "Arène 10", "Vallée royale", "Ligue légende", "Ultime"],
    arenas: ["Arène de formation", "Arène gobeline", "Vallée osseuse", "Pic du gel", "Ligue légende"],
    clanRoles: ["Membre", "Aîné", "Chef adjoint", "Chef"],
  },
});
