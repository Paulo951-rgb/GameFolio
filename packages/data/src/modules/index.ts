import type { ModuleDefinition } from "@gamer-cv/types";
import { CompetitiveModule } from "./competitive.module";
import { SinglePlayerModule } from "./singleplayer.module";
import { SandboxModule } from "./sandbox.module";
import { ProgressionModule } from "./progression.module";
import { ClanModule } from "./clan.module";
import { RacingModule } from "./racing.module";
import { BattleRoyaleModule } from "./battleroyale.module";
import { GachaModule } from "./gacha.module";
import { SurvivalModule } from "./survival.module";
import { BuildingModule } from "./building.module";
import { RedstoneModule } from "./redstone.module";
import { ModdingModule } from "./modding.module";
import { ServerAdminModule } from "./serveradmin.module";
import { ContentCreatorModule } from "./contentcreator.module";
import { CompletionModule } from "./completion.module";
import { AchievementModule } from "./achievement.module";
import { MobaModule } from "./moba.module";
import { MmoModule } from "./mmo.module";
import { GuildModule } from "./guild.module";
import { CardGameModule } from "./cardgame.module";
import { StrategyModule } from "./strategy.module";
import { SportsModule } from "./sports.module";
import { FightingModule } from "./fighting.module";
import { SpeedrunModule } from "./speedrun.module";
import { CreativeModule } from "./creative.module";
import { WeaponBasedModule } from "./weaponbased.module";
import { RoleBasedModule } from "./rolebased.module";
import { CharacterBasedModule } from "./characterbased.module";

/**
 * Module registry — the canonical list of reusable generic modules. The module
 * engine (packages/core) reads module ids referenced by a game definition and
 * resolves them from this map. A new module = new file + one line here.
 */
export const modules: ModuleDefinition[] = [
  // core competitive / character / role / weapon
  CompetitiveModule,
  CharacterBasedModule,
  RoleBasedModule,
  WeaponBasedModule,
  MobaModule,
  // battle royale / racing / sports / fighting
  BattleRoyaleModule,
  RacingModule,
  SportsModule,
  FightingModule,
  // single-player / completion / achievement / speedrun
  SinglePlayerModule,
  CompletionModule,
  AchievementModule,
  SpeedrunModule,
  // sandbox / survival / building / redstone / creative / modding / server
  SandboxModule,
  SurvivalModule,
  BuildingModule,
  RedstoneModule,
  CreativeModule,
  ModdingModule,
  ServerAdminModule,
  ContentCreatorModule,
  // progression / clan / guild / mmo / gacha / card / strategy
  ProgressionModule,
  ClanModule,
  GuildModule,
  MmoModule,
  GachaModule,
  CardGameModule,
  StrategyModule,
];

export const moduleRegistry = new Map<string, ModuleDefinition>(
  modules.map((m) => [m.id, m]),
);

export {
  CompetitiveModule,
  SinglePlayerModule,
  SandboxModule,
  ProgressionModule,
  ClanModule,
  RacingModule,
  BattleRoyaleModule,
  GachaModule,
  SurvivalModule,
  BuildingModule,
  RedstoneModule,
  ModdingModule,
  ServerAdminModule,
  ContentCreatorModule,
  CompletionModule,
  AchievementModule,
  MobaModule,
  MmoModule,
  GuildModule,
  CardGameModule,
  StrategyModule,
  SportsModule,
  FightingModule,
  SpeedrunModule,
  CreativeModule,
  WeaponBasedModule,
  RoleBasedModule,
  CharacterBasedModule,
};
