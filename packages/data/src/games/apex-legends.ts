import { defineGame } from "@gamer-cv/core";

/** Apex Legends — battle royale + competitive ranked ladder. */
export const ApexLegends = defineGame({
  id: "apex-legends",
  name: "Apex Legends",
  publisher: "Respawn",
  genres: ["FPS", "battle royale"],
  icon: "/icons/apex.svg",
  modules: ["battleroyale", "competitive"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Prédateur"],
    roles: ["Reconnaissance", "Assaut", "Support", "Contrôle"],
    characters: ["Wraith", "Pathfinder", "Octane", "Bloodhound", "Loba", "Horizon"],
  },
});
