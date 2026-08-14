import { defineGame } from "@gamer-cv/core";

export const RainbowSixSiege = defineGame({
  id: "rainbow-six-siege",
  name: "Rainbow Six Siege",
  publisher: "Ubisoft",
  genres: ["FPS", "tactique"],
  icon: "/icons/r6.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Cuivre", "Bronze", "Argent", "Or", "Platine", "Émeraude", "Diamant", "Champion"],
    roles: ["Entry", "Support", "Fragger", "Anchor", "Roamer"],
    characters: ["Ash", "Thermite", "Mute", "Jäger", "Valkyrie", "Bandit"],
  },
});
