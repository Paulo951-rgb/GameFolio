import { defineGame } from "@gamer-cv/core";

export const Destiny2 = defineGame({
  id: "destiny-2",
  name: "Destiny 2",
  publisher: "Bungie",
  genres: ["FPS", "RPG", "looter"],
  platforms: ["PC", "Console"],
  icon: "/icons/destiny2.svg",
  modules: ["progression", "clan", "competitive"],
  gameData: {
    ranks: ["Gardien", "Légendaire", "Héroïque", "Illuminé", "Ascendant", "Légende suprême", "Maître"],
    arenas: ["Assaut", "Raid", "Donjon", "Gambit", "Épreuve", "Forge"],
    clanRoles: ["Membre", "Adepte", "Gardien", "Officier", "Fondateur"],
    roles: ["Titans", "Chasseur", "Arcaniste"],
    characters: [],
  },
});
