import { defineGame } from "@gamer-cv/core";

export const StreetFighter6 = defineGame({
  id: "street-fighter-6",
  name: "Street Fighter 6",
  publisher: "Capcom",
  genres: ["combat", "compétitif"],
  icon: "/icons/sf6.svg",
  modules: ["competitive"],
  gameData: {
    ranks: ["Rookie", "Bronze", "Argent", "Or", "Platine", "Diamant", "Maître", "Maître Légende"],
    roles: ["Rushdown", "Zoner", "Grappler", "Footsies"],
    characters: ["Ryu", "Ken", "Chun-Li", "Luke", "Juri", "Cammy"],
  },
});
