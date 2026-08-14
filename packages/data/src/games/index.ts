import type { GameDefinition, GameRegistry } from "@gamer-cv/types";
import { Valorant } from "./valorant";
import { Minecraft } from "./minecraft";
import { Hades } from "./hades";
import { ClashOfClans } from "./clash-of-clans";
import { LeagueOfLegends } from "./league-of-legends";
import { CounterStrike2 } from "./counter-strike-2";
import { ApexLegends } from "./apex-legends";
import { Fortnite } from "./fortnite";
import { CallOfDutyWarzone } from "./warzone";
import { RocketLeague } from "./rocket-league";
import { ForzaHorizon5 } from "./forza-horizon-5";
import { GranTurismo7 } from "./gran-turismo-7";
import { MarioKart8 } from "./mario-kart-8";
import { Trackmania } from "./trackmania";
import { TheWitcher3 } from "./the-witcher-3";
import { EldenRing } from "./elden-ring";
import { HollowKnight } from "./hollow-knight";
import { ZeldaTearsOfTheKingdom } from "./zelda-totk";
import { BaldursGate3 } from "./baldurs-gate-3";
import { Cyberpunk2077 } from "./cyberpunk-2077";
import { Terraria } from "./terraria";
import { Rust } from "./rust";
import { ClashRoyale } from "./clash-royale";
import { BrawlStars } from "./brawl-stars";
import { GenshinImpact } from "./genshin-impact";
import { HonkaiStarRail } from "./honkai-star-rail";
import { FateGrandOrder } from "./fate-grand-order";
import { Arknights } from "./arknights";
import { WorldOfWarcraft } from "./world-of-warcraft";
import { FinalFantasyXIV } from "./final-fantasy-xiv";
import { Dota2 } from "./dota-2";
import { Overwatch2 } from "./overwatch-2";
import { RainbowSixSiege } from "./rainbow-six-siege";
import { StreetFighter6 } from "./street-fighter-6";
import { FIFA } from "./ea-sports-fc";
import { AmongUs } from "./among-us";
import { StardewValley } from "./stardew-valley";
import { MonsterHunterWorld } from "./monster-hunter-world";
import { Destiny2 } from "./destiny-2";
import { PUBG } from "./pubg";
import { LeagueOfLegendsWildRift } from "./wild-rift";
import { GeometryDash } from "./geometry-dash";
import { Roblox } from "./roblox";
import { moduleRegistry } from "../modules/index";
import { resolveGame } from "@gamer-cv/core";

/**
 * Game registry — the canonical catalogue of games. Adding a game = new file
 * + one line in the `games` array. A game = a PR, not a UI component
 * (architecture doc section 5). The catalogue is grouped by module family so
 * it's easy to see coverage at a glance.
 *
 * `buildGameRegistry` validates at module-load time that every game's modules
 * resolve against the module registry, so a misconfigured game fails loudly at
 * startup rather than at user runtime.
 */
export const games: GameDefinition[] = [
  // FPS / MOBA / tactical competitive
  Valorant,
  LeagueOfLegends,
  Dota2,
  CounterStrike2,
  Overwatch2,
  RainbowSixSiege,
  RocketLeague,
  StreetFighter6,
  FIFA,
  LeagueOfLegendsWildRift,
  // battle royale
  ApexLegends,
  Fortnite,
  CallOfDutyWarzone,
  PUBG,
  // racing
  ForzaHorizon5,
  GranTurismo7,
  MarioKart8,
  Trackmania,
  // sandbox / survival
  Minecraft,
  Terraria,
  Rust,
  AmongUs,
  Roblox,
  // single-player / story
  Hades,
  TheWitcher3,
  EldenRing,
  HollowKnight,
  ZeldaTearsOfTheKingdom,
  BaldursGate3,
  Cyberpunk2077,
  StardewValley,
  MonsterHunterWorld,
  GeometryDash,
  // progression + clan (mobile / MMO)
  ClashOfClans,
  ClashRoyale,
  BrawlStars,
  WorldOfWarcraft,
  FinalFantasyXIV,
  Destiny2,
  // gacha
  GenshinImpact,
  HonkaiStarRail,
  FateGrandOrder,
  Arknights,
];

export function buildGameRegistry(): GameRegistry {
  const map = new Map<string, GameDefinition>();
  for (const g of games) {
    // Eager validation: ensures composite schema builds (no unknown modules,
    // no ambiguous overlapping field keys across composed modules).
    resolveGame(g, moduleRegistry);
    if (map.has(g.id)) {
      throw new Error(`Duplicate game id "${g.id}" in registry`);
    }
    map.set(g.id, g);
  }
  return map;
}

export const gameRegistry = buildGameRegistry();

/**
 * Autocomplete search over the catalogue (for the GameSearchCombobox).
 * Matches on name or genre; case-insensitive; simple for the MVP.
 */
export function searchGames(query: string, limit = 10): GameDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return games.slice(0, limit);
  return games
    .filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.genres.some((genre) => genre.toLowerCase().includes(q)),
    )
    .slice(0, limit);
}
