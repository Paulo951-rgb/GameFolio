import type { ModuleDefinition } from "@gamer-cv/types";
import { CompetitiveModule } from "./competitive.module.js";
import { SinglePlayerModule } from "./singleplayer.module.js";
import { SandboxModule } from "./sandbox.module.js";
import { ProgressionModule } from "./progression.module.js";
import { ClanModule } from "./clan.module.js";

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
};
