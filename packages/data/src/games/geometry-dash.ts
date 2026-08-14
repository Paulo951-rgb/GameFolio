import { defineGame } from "@gamer-cv/core";

export const GeometryDash = defineGame({
  id: "geometry-dash",
  name: "Geometry Dash",
  publisher: "RobTop Games",
  genres: ["rythme", "indie"],
  platforms: ["PC", "Mobile"],
  icon: "/icons/gd.svg",
  modules: ["singleplayer"],
  gameData: {
    trophies: ["Stéréo Folie", "Niveau démon", "Tous les niveau principal", "Practice"],
  },
});
