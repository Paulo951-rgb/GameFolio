import type { GamerProfile, GameEntry, PersonalInfo, ThemeConfig, GeneratedText, Achievement } from "@gamer-cv/types";
import { Prisma, type GamerProfile as DBProfile, type ProfileGame as DBGame } from "@prisma/client";

/**
 * Map between the typed GamerProfile (used everywhere in the app) and the
 * Prisma rows (User-owned cloud persistence). personalInfo / themeConfig /
 * generatedText / moduleData are Json columns; playerTypes is Json because
 * SQLite has no scalar-list support (would be String[] on Postgres — the app
 * type stays string[] regardless, so this is transparent to the rest of the
 * codebase).
 */

export function dbGamesToEntries(games: DBGame[]): GameEntry[] {
  return games
    .map((g) => ({
      gameId: g.gameId,
      moduleData: (g.moduleData ?? {}) as Record<string, unknown>,
      freeText: g.freeText ?? undefined,
      order: g.order,
    }))
    .sort((a, b) => a.order - b.order);
}

export function dbProfileToProfile(row: DBProfile & { games?: DBGame[] }): GamerProfile {
  return {
    id: row.id,
    personalInfo: (row.personalInfo ?? { gamerTag: "", visibility: {} }) as PersonalInfo,
    playerTypes: (row.playerTypes ?? []) as string[],
    games: dbGamesToEntries(row.games ?? []),
    achievements: (row.achievements ?? []) as Achievement[],
    templateId: row.templateId,
    themeConfig: (row.themeConfig ?? { templateId: row.templateId }) as ThemeConfig,
    generatedText: (row.generatedText ?? undefined) as GeneratedText | undefined,
  };
}

export interface ProfileUpsertInput {
  id?: string;
  userId?: string | null;
  personalInfo: PersonalInfo;
  playerTypes: string[];
  /** Profile-level achievements. Optional for backward compat with callers
   *  built before the field existed; defaults to [] in the mapper. */
  achievements?: Achievement[];
  templateId: string;
  themeConfig: ThemeConfig;
  generatedText?: GeneratedText;
  games: GameEntry[];
}

/**
 * Split a GamerProfile into the Prisma row fields + nested ProfileGame writes.
 * Used by create (nested create) and patch (nested deleteMany + recreate) so the
 * games array always reflects the latest client state.
 */
export function profileToDbFields(input: ProfileUpsertInput) {
  // Build the Prisma scalar fields explicitly (typed) rather than spreading a
  // loose record — Prisma's checked create/update inputs reject unknown keys.
  // JSON columns: a real value is wrapped as InputJsonValue; absence is the
  // sentinel Prisma.JsonNull (plain `null` is rejected by the checked input).
  const fields = {
    personalInfo: input.personalInfo as Prisma.InputJsonValue,
    playerTypes: input.playerTypes as Prisma.InputJsonValue,
    achievements: (input.achievements ?? []) as Prisma.InputJsonValue,
    templateId: input.templateId,
    themeConfig: input.themeConfig as Prisma.InputJsonValue,
    generatedText: (input.generatedText ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
  };
  return fields;
}

/**
 * The create payload: scalar fields + (optionally) the owner userId. Anonymous
 * profiles pass userId=null. Typed so Prisma's checked create input is happy.
 */
export function profileToCreateData(input: ProfileUpsertInput) {
  return { ...profileToDbFields(input), userId: input.userId ?? null };
}

/**
 * The update payload: scalar fields only. Never reassigns userId (ownership is
 * immutable after create).
 */
export function profileToUpdateData(input: ProfileUpsertInput) {
  return profileToDbFields(input);
}

export function gamesToNestedCreate(games: GameEntry[]) {
  // Drop empty placeholder entries (gameId="") the wizard creates when the user
  // bumps the game count before picking a title — they carry no data and would
  // otherwise be persisted as dead rows (and inflate the dashboard game count).
  return games
    .filter((g) => g.gameId !== "")
    .map((g, i) => ({
      gameId: g.gameId,
      moduleData: g.moduleData as Prisma.InputJsonValue,
      freeText: g.freeText ?? null,
      order: i,
    }));
}
