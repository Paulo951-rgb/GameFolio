import { defineGame } from "@gamer-cv/core";

/** Apex Legends — battle royale + competitive ranked ladder. */
export const ApexLegends = defineGame({
  id: "apex-legends",
  name: "Apex Legends",
  publisher: "EA",
  developer: "Respawn Entertainment",
  genres: ["FPS", "battle royale", "compétitif"],
  aliases: ["apex", "apex legend", "apexlegends"],
  platforms: ["PC", "Console", "Mobile"],
  releaseYear: 2019,
  icon: "/icons/apex.svg",
  modules: ["battleroyale", "competitive", "characterbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Prédateur"],
    roles: ["Reconnaissance", "Assaut", "Support", "Contrôle"],
    characters: ["Wraith", "Pathfinder", "Octane", "Bloodhound", "Loba", "Horizon", "Valkyrie", "Ash", "Mad Maggie", "Conduit", "Alter", "Catalyst", "Seer", "Bangalore", "Caustic", "Wattson", "Rampart", "Newcastle", "Gibraltar", "Caustic"],
  },
});
