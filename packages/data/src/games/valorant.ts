import { defineGame } from "@gamer-cv/core";

export const Valorant = defineGame({
  id: "valorant",
  name: "Valorant",
  publisher: "Riot Games",
  developer: "Riot Games",
  genres: ["FPS", "tactique", "compétitif"],
  aliases: ["valo", "valorant", "valorant riot"],
  platforms: ["PC"],
  releaseYear: 2020,
  icon: "/icons/valorant.svg",
  modules: ["competitive", "characterbased", "weaponbased"],
  gameData: {
    ranks: ["Fer", "Bronze", "Argent", "Or", "Platine", "Diamant", "Ascendant", "Immortel", "Immortel 1-3", "Radiant"],
    roles: ["Duelliste", "Initiateur", "Contrôleur", "Sentinelle"],
    characters: ["Jett", "Raze", "Reyna", "Phoenix", "Yoru", "Neon", "Iso", "Waylay", "Sova", "Breach", "Skye", "KAY/O", "Fade", "Gekko", "Tejo", "Omen", "Brimstone", "Viper", "Astra", "Harbor", "Clove", "Sage", "Cypher", "Killjoy", "Chamber", "Vyse", "Deadlock"],
    weapons: ["Classique", "Court", "Frenzy", "Ghost", "Sheriff", "Stinger", "Spectre", "Bucky", "Judge", "Bulldog", "Guardian", "Phantom", "Vandal", "Marshal", "Outlaw", "Operator", "Ares", "Odin"],
  },
});
