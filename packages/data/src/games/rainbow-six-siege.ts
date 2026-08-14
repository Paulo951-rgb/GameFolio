import { defineGame } from "@gamer-cv/core";

export const RainbowSixSiege = defineGame({
  id: "rainbow-six-siege",
  name: "Rainbow Six Siege",
  publisher: "Ubisoft",
  developer: "Ubisoft Montreal",
  genres: ["FPS", "tactique", "compétitif"],
  aliases: ["r6", "r6 siege", "rainbow six", "siege"],
  platforms: ["PC", "Console"],
  releaseYear: 2015,
  icon: "/icons/r6.svg",
  modules: ["competitive", "rolebased", "characterbased"],
  gameData: {
    ranks: ["Cuivre", "Bronze", "Argent", "Or", "Platine", "Émeraude", "Diamant", "Champion"],
    roles: ["Entry", "Support", "Fragger", "Anchor", "Roamer", "IGL"],
    characters: ["Ash", "Thermite", "Mute", "Jäger", "Valkyrie", "Bandit", "Sledge", "Thatcher", "Smoke", "Mute", "Lesion", "Kapkan", "Pulse", "Caveira", "Doc", "Rook", "Echo", "Maestro", "Mozzie"],
  },
});
