import { defineGame } from "@gamer-cv/core";

const base = {
  publisher: "EA",
  developer: "DICE",
  genres: ["FPS", "multijoueur"],
  platforms: ["PC", "Console"],
  aliases: ["bf", "battlefield"],
  modules: ["competitive", "weaponbased"],
  gameData: {
    roles: ["Assaut", "Médic", "Soutien", "Éclaireur"],
    weapons: ["M1 Garand", "STG 44", "MP40", "Kar98k", "Bren", "Springfield"],
  },
};

export const Battlefield1 = defineGame({
  id: "battlefield-1",
  name: "Battlefield 1",
  ...base,
  releaseYear: 2016,
  icon: "/icons/bf1.svg",
  gameData: { ...base.gameData, ranks: [] },
});

export const Battlefield4 = defineGame({
  id: "battlefield-4",
  name: "Battlefield 4",
  ...base,
  releaseYear: 2013,
  icon: "/icons/bf4.svg",
  gameData: {
    roles: ["Assaut", "Médic", "Soutien", "Éclaireur"],
    weapons: ["M416", "AEK-971", "SCAR-H", "ACE 23", "AWM", "MP7"],
    ranks: [],
  },
});

export const BattlefieldV = defineGame({
  id: "battlefield-v",
  name: "Battlefield V",
  ...base,
  releaseYear: 2018,
  icon: "/icons/bfv.svg",
  gameData: {
    roles: ["Assaut", "Médic", "Soutien", "Éclaireur"],
    weapons: ["STG 44", "Turner SMLE", "KE7", "ZK-383", "Kar98k"],
    ranks: [],
  },
});

export const Battlefield2042 = defineGame({
  id: "battlefield-2042",
  name: "Battlefield 2042",
  ...base,
  releaseYear: 2021,
  icon: "/icons/bf2042.svg",
  gameData: {
    roles: ["Assaut", "Médic", "Soutien", "Éclaireur"],
    weapons: ["M5A3", "AK-24", "PBX-45", "DM7", "SVK", "DXR-1"],
    ranks: [],
  },
});
