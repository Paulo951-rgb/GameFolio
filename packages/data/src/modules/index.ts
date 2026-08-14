import type { ModuleDefinition } from "@gamer-cv/types";
import { CompetitiveModule } from "./competitive.module";
import { SinglePlayerModule } from "./singleplayer.module";
import { SandboxModule } from "./sandbox.module";
import { ProgressionModule } from "./progression.module";
import { ClanModule } from "./clan.module";
import { RacingModule } from "./racing.module";
import { BattleRoyaleModule } from "./battleroyale.module";
import { GachaModule } from "./gacha.module";

/**
 * Module registry — the canonical list of reusable generic modules. The module
 * engine (packages/core) reads module ids referenced by a game definition and
 * resolves them from this map. A new module = new file + one line here.
 */
export const modules: ModuleDefinition[] = [
  CompetitiveModule,
  SinglePlayerModule,
  SandboxModule,
  ProgressionModule,
  ClanModule,
  RacingModule,
  BattleRoyaleModule,
  GachaModule,
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
};
