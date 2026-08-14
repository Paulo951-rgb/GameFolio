/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
  games,
  gameRegistry,
  moduleRegistry,
  searchGames,
} from "../src/index.js";
import { resolveGame, resolveGameSchema, validateGameEntry } from "@gamer-cv/core";

describe("data package — games & modules", () => {
  it("has at least 30 games in the scaled catalogue", () => {
    expect(games.length).toBeGreaterThanOrEqual(30);
  });

  it("all games have unique ids", () => {
    const ids = games.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every game resolves (modules exist, composite schema builds)", () => {
    for (const g of games) {
      const resolved = resolveGame(g, moduleRegistry);
      expect(resolved.modules.length).toBeGreaterThan(0);
      expect(resolved.compositeSchema).toBeDefined();
    }
  });

  it("multi-module games compose shared fields (hours) without collision", () => {
    // Genshin = gacha + singleplayer (both declare hours + completionPercent).
    const genshin = gameRegistry.get("genshin-impact");
    expect(genshin).toBeDefined();
    const resolved = resolveGame(genshin!, moduleRegistry);
    expect(resolved.modules.length).toBe(2);
    expect(resolved.compositeSchema.shape).toHaveProperty("hours");
    // No duplicate field rendered despite both modules declaring `hours`.
    const hoursFields = resolved.fields.filter((f) => f.key === "hours");
    expect(hoursFields.length).toBe(1);
  });

  it("Clash of Clans composes progression + clan", () => {
    const resolved = resolveGame(
      gameRegistry.get("clash-of-clans")!,
      moduleRegistry,
    );
    const keys = Object.keys(resolved.compositeSchema.shape);
    expect(keys).toContain("accountLevel"); // progression
    expect(keys).toContain("clanName"); // clan
    expect(keys.length).toBeGreaterThan(6);
  });

  it("resolveGameSchema returns the Valorant composite schema", () => {
    const schema = resolveGameSchema("valorant", gameRegistry, moduleRegistry);
    expect(schema).not.toBeNull();
    expect(schema!.shape).toHaveProperty("currentRank");
    expect(schema!.shape).toHaveProperty("mainCharacters");
  });

  it("validateGameEntry accepts a filled Valorant entry", () => {
    const res = validateGameEntry(
      "valorant",
      { currentRank: "Immortel", hours: 500, mainCharacters: ["Jett"] },
      gameRegistry,
      moduleRegistry,
    );
    expect(res.success).toBe(true);
  });

  it("validateGameEntry rejects an out-of-enum playstyle for Valorant", () => {
    const res = validateGameEntry(
      "valorant",
      { playstyle: "agressif" }, // valid value
      gameRegistry,
      moduleRegistry,
    );
    expect(res.success).toBe(true);
    const resBad = validateGameEntry(
      "valorant",
      { playstyle: "lunar" }, // invalid enum
      gameRegistry,
      moduleRegistry,
    );
    expect(resBad.success).toBe(false);
  });

  it("searchGames matches by name and genre", () => {
    expect(searchGames("valo").map((g) => g.id)).toContain("valorant");
    expect(searchGames("FPS").map((g) => g.id)).toContain("valorant");
  });

  it("searchGames returns up to limit games for an empty query", () => {
    expect(searchGames("").length).toBeLessThanOrEqual(10);
  });
});

describe("module registry", () => {
  it("contains all generic modules (competitive, singleplayer, sandbox, progression, clan, racing, battleroyale, gacha)", () => {
    for (const id of [
      "competitive",
      "singleplayer",
      "sandbox",
      "progression",
      "clan",
      "racing",
      "battleroyale",
      "gacha",
    ]) {
      expect(moduleRegistry.has(id)).toBe(true);
    }
  });

  it("every module has at least one field descriptor", () => {
    for (const mod of moduleRegistry.values()) {
      expect(mod.fields.length).toBeGreaterThan(0);
    }
  });
});
