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
import { ForzaMotorsport } from "./forza-motorsport";
import { GranTurismo7 } from "./gran-turismo-7";
import { MarioKart8 } from "./mario-kart-8";
import { Trackmania } from "./trackmania";
import { F1 } from "./f1";
import { NeedForSpeed } from "./need-for-speed";
import { AssettoCorsa } from "./assetto-corsa";
import { TheWitcher3 } from "./the-witcher-3";
import { EldenRing } from "./elden-ring";
import { DarkSouls } from "./dark-souls";
import { Skyrim } from "./skyrim";
import { Fallout } from "./fallout";
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
import { Smite } from "./smite";
import { Overwatch2 } from "./overwatch-2";
import { RainbowSixSiege } from "./rainbow-six-siege";
import { StreetFighter6 } from "./street-fighter-6";
import { FIFA } from "./ea-sports-fc";
import { AmongUs } from "./among-us";
import { StardewValley } from "./stardew-valley";
import { MonsterHunterWorld } from "./monster-hunter-world";
import { Destiny2 } from "./destiny-2";
import { PUBG } from "./pubg";
import { PUBGMobile } from "./pubg-mobile";
import { LeagueOfLegendsWildRift } from "./wild-rift";
import { GeometryDash } from "./geometry-dash";
import { Roblox } from "./roblox";
import { CallOfDuty } from "./call-of-duty";
import { CallOfDutyMobile } from "./call-of-duty-mobile";
import { CounterStrikeGO } from "./counter-strike-go";
import { Battlefield1, Battlefield4, BattlefieldV, Battlefield2042 } from "./battlefield-series";
import { EscapeFromTarkov } from "./escape-from-tarkov";
import { FallGuys } from "./fall-guys";
import { ARKSurvivalEvolved } from "./ark-survival-evolved";
import { Valheim } from "./valheim";
import { SevenDaysToDie } from "./seven-days-to-die";
import { ProjectZomboid } from "./project-zomboid";
import { GodOfWar } from "./god-of-war";
import { MarvelsSpiderMan } from "./marvels-spider-man";
import { TheLastOfUs } from "./the-last-of-us";
import { GhostOfTsushima } from "./ghost-of-tsushima";
import { HorizonZeroDawn } from "./horizon-zero-dawn";
import { Uncharted } from "./uncharted";
import { Halo } from "./halo";
import { SeaOfThieves } from "./sea-of-thieves";
import { Gears } from "./gears-of-war";
import { searchGames as searchGamesImpl } from "../search";
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
  // FPS / tactical competitive
  Valorant,
  CounterStrike2,
  CounterStrikeGO,
  CallOfDuty,
  CallOfDutyMobile,
  EscapeFromTarkov,
  Battlefield1,
  Battlefield4,
  BattlefieldV,
  Battlefield2042,
  RainbowSixSiege,
  Overwatch2,
  Halo,
  Gears,
  // MOBA
  LeagueOfLegends,
  Dota2,
  LeagueOfLegendsWildRift,
  Smite,
  // battle royale
  ApexLegends,
  Fortnite,
  CallOfDutyWarzone,
  PUBG,
  PUBGMobile,
  FallGuys,
  // racing
  RocketLeague,
  ForzaHorizon5,
  ForzaMotorsport,
  GranTurismo7,
  MarioKart8,
  Trackmania,
  F1,
  NeedForSpeed,
  AssettoCorsa,
  // sandbox / survival / creative
  Minecraft,
  Terraria,
  Rust,
  AmongUs,
  Roblox,
  ARKSurvivalEvolved,
  Valheim,
  SevenDaysToDie,
  ProjectZomboid,
  SeaOfThieves,
  // single-player / story RPG
  Hades,
  TheWitcher3,
  EldenRing,
  DarkSouls,
  Skyrim,
  Fallout,
  HollowKnight,
  ZeldaTearsOfTheKingdom,
  BaldursGate3,
  Cyberpunk2077,
  StardewValley,
  MonsterHunterWorld,
  GodOfWar,
  MarvelsSpiderMan,
  TheLastOfUs,
  GhostOfTsushima,
  HorizonZeroDawn,
  Uncharted,
  GeometryDash,
  // fighting / sports / strategy
  StreetFighter6,
  FIFA,
  // progression + clan (mobile / MMO / gacha)
  ClashOfClans,
  ClashRoyale,
  BrawlStars,
  WorldOfWarcraft,
  FinalFantasyXIV,
  Destiny2,
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
 * Multi-strategy: exact → starts-with → includes → genre → platform → fuzzy
 * (simple typo tolerance). See ./search.ts for ranking detail.
 */
export function searchGames(query: string, limit = 10): GameDefinition[] {
  return searchGamesImpl(games, query, limit);
}
