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
  it("has at least 4 test games", () => {
    expect(games.length).toBeGreaterThanOrEqual(4);
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

  it("Clash of Clans composes progression + clan with no key collision", () => {
    const resolved = resolveGame(
      gameRegistry.get("clash-of-clans")!,
      moduleRegistry,
    );
    const keys = Object.keys(resolved.compositeSchema.shape);
    // both modules contribute fields
    expect(keys).toContain("accountLevel"); // progression
    expect(keys).toContain("clanName"); // clan
    // no collision: union of both modules' fields
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

  it("searchGames returns the whole catalogue for an empty query (up to limit)", () => {
    expect(searchGames("").length).toBeLessThanOrEqual(10);
  });
});

describe("module registry", () => {
  it("contains all 5 generic modules", () => {
    for (const id of ["competitive", "singleplayer", "sandbox", "progression", "clan"]) {
      expect(moduleRegistry.has(id)).toBe(true);
    }
  });

  it("every module has at least one field descriptor", () => {
    for (const mod of moduleRegistry.values()) {
      expect(mod.fields.length).toBeGreaterThan(0);
    }
  });
});
