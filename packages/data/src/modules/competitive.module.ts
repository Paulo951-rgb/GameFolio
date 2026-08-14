import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

/**
 * Competitive module — the detailed FPS/MOBA/tactical competitive profile.
 * Covers the Valorant-style breakdown (§8): experience, ranking, gameplay
 * (roles + characters), performance (K/D, headshot %), competition context and
 * communication. `optionsSource: "game.ranks"` etc. resolves concrete options
 * at render time from the owning game's gameData, so one module serves Valorant,
 * LoL, CS, Rocket League, ...
 *
 * Composable with weaponBased / roleBased / characterBased for games that want
 * a finer breakdown. Shared keys (hours, currentRank, roles, mainCharacters,
 * playstyle) intentionally overlap with those modules — last-write-wins merge.
 */
export const CompetitiveModule = defineModule({
  id: "competitive",
  schema: z.object({
    // --- Experience ---
    hours: z.number().optional(),
    seasonsPlayed: z.number().optional(),
    // --- Ranking ---
    currentRank: z.string().optional(),
    highestRank: z.string().optional(),
    rankSeason: z.string().optional(), // e.g. "Episode 7 Act 2"
    // --- Gameplay ---
    roles: z.array(z.string()).optional(),
    mainCharacters: z.array(z.string()).optional(),
    secondaryCharacters: z.array(z.string()).optional(),
    weapons: z.array(z.string()).optional(),
    playstyle: z.enum(["agressif", "défensif", "polyvalent", "support"]).optional(),
    // --- Performance ---
    kdRatio: z.number().optional(),
    headshotPercent: z.number().min(0).max(100).optional(),
    winRate: z.number().min(0).max(100).optional(),
    // --- Competition ---
    queueType: z.enum(["solo", "duo", "équipe", "mixte"]).optional(),
    competitiveExperience: z.string().optional(),
    // --- Communication ---
    igl: z.string().optional(),
    communication: z.enum(["texte", "vocal", "les deux", "aucune"]).optional(),
  }),
  fields: [
    { key: "hours", label: "Heures approximatives", type: "number" },
    { key: "seasonsPlayed", label: "Saisons jouées", type: "number" },
    { key: "currentRank", label: "Rang actuel", type: "select", optionsSource: "game.ranks" },
    { key: "highestRank", label: "Meilleur rang", type: "select", optionsSource: "game.ranks" },
    { key: "rankSeason", label: "Saison / épisode du rang", type: "text", placeholder: "Ex. Episode 7 Act 2" },
    { key: "roles", label: "Rôle(s) principal(aux)", type: "multiselect", optionsSource: "game.roles" },
    { key: "mainCharacters", label: "Personnages principaux", type: "multiselect", optionsSource: "game.characters" },
    { key: "secondaryCharacters", label: "Personnages secondaires", type: "multiselect", optionsSource: "game.characters" },
    { key: "weapons", label: "Armes préférées", type: "multiselect", optionsSource: "game.weapons" },
    { key: "playstyle", label: "Style de jeu", type: "select", options: ["agressif", "défensif", "polyvalent", "support"] },
    { key: "kdRatio", label: "Ratio K/D", type: "number", placeholder: "1.25" },
    { key: "headshotPercent", label: "Headshot %", type: "number", placeholder: "28" },
    { key: "winRate", label: "Taux de victoire %", type: "number", placeholder: "55" },
    { key: "queueType", label: "Type de file", type: "select", options: ["solo", "duo", "équipe", "mixte"] },
    { key: "competitiveExperience", label: "Expérience compétitive (équipe, tournois…)", type: "textarea", placeholder: "Capitaine d'équipe, tournois universitaires…" },
    { key: "igl", label: "IGL (In-Game Leader)", type: "select", options: ["oui", "non"] },
    { key: "communication", label: "Communication", type: "select", options: ["texte", "vocal", "les deux", "aucune"] },
  ],
});
