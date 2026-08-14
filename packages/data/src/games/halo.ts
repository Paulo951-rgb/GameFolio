import { defineGame } from "@gamer-cv/core";

export const Halo = defineGame({
  id: "halo",
  name: "Halo (série / Infinite)",
  publisher: "Xbox Game Studios",
  developer: "343 Industries",
  genres: ["FPS", "compétitif", "action"],
  aliases: ["halo", "halo infinite", "halo 3", "halo mcc"],
  platforms: ["PC", "Console"],
  releaseYear: 2001,
  icon: "/icons/halo.svg",
  modules: ["competitive", "weaponbased"],
  gameData: {
    ranks: ["Bronze", "Argent", "Or", "Platine", "Diamant", "Onyx"],
    roles: ["Slayer", "Objective", "Support"],
    characters: [],
    weapons: ["Battle Rifle", "DMR", "Pistolet Magnum", "Needler", "Energy Sword", "Sniper", "Rocket Launcher"],
  },
});
