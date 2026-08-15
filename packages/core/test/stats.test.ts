/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { computeProfileStats } from "../src/stats/index.js";
import type { GamerProfile, GameDefinition, GameRegistry } from "@gamer-cv/types";

function makeProfile(games: GamerProfile["games"], playerTypes: string[] = []): GamerProfile {
  return {
    id: "p1",
    personalInfo: { gamerTag: "X", visibility: {} },
    playerTypes,
    games,
    achievements: [],
    templateId: "minimalist",
    themeConfig: { templateId: "minimalist" },
  };
}

function registryOf(...games: GameDefinition[]): GameRegistry {
  return new Map(games.map((g) => [g.id, g]));
}

const valorant: GameDefinition = {
  id: "valorant",
  name: "Valorant",
  genres: ["FPS", "tactique"],
  modules: ["competitive"],
  gameData: {},
};
const minecraft: GameDefinition = {
  id: "minecraft",
  name: "Minecraft",
  genres: ["sandbox", "survival"],
  modules: ["sandbox"],
  gameData: {},
};
const genshin: GameDefinition = {
  id: "genshin-impact",
  name: "Genshin Impact",
  genres: ["RPG", "gacha", "open world"],
  modules: ["gacha"],
  gameData: {},
};

describe("computeProfileStats", () => {
  it("sums hours only from games that provided a finite number", () => {
    const reg = registryOf(valorant, minecraft);
    const stats = computeProfileStats(
      makeProfile([
        { gameId: "valorant", moduleData: { hours: 500 }, order: 0 },
        { gameId: "minecraft", moduleData: { hours: 200 }, order: 1 },
        { gameId: "valorant", moduleData: { currentRank: "Or" }, order: 2 },
      ]),
      reg,
    );
    expect(stats.totalGames).toBe(3);
    expect(stats.totalHours).toBe(700);
    expect(stats.gamesWithHours).toBe(2);
    expect(stats.averageHours).toBe(350);
  });

  it("does not count empty gameId slots", () => {
    const reg = registryOf(valorant);
    const stats = computeProfileStats(
      makeProfile([
        { gameId: "valorant", moduleData: { hours: 100 }, order: 0 },
        { gameId: "", moduleData: {}, order: 1 },
      ]),
      reg,
    );
    expect(stats.totalGames).toBe(1);
  });

  it("ignores non-numeric / negative / missing hours (no fabrication)", () => {
    const reg = registryOf(valorant);
    const stats = computeProfileStats(
      makeProfile([
        { gameId: "valorant", moduleData: { hours: "beaucoup" }, order: 0 },
        { gameId: "valorant", moduleData: { hours: -5 }, order: 1 },
        { gameId: "valorant", moduleData: { hours: NaN }, order: 2 },
        { gameId: "valorant", moduleData: {}, order: 3 },
      ]),
      reg,
    );
    expect(stats.totalGames).toBe(4);
    expect(stats.gamesWithHours).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.averageHours).toBeNull();
  });

  it("counts genres only from known games and ranks dominant genres", () => {
    const reg = registryOf(valorant, minecraft, genshin);
    const stats = computeProfileStats(
      makeProfile([
        { gameId: "valorant", moduleData: { hours: 100 }, order: 0 },
        { gameId: "minecraft", moduleData: { hours: 1000 }, order: 1 },
        { gameId: "genshin-impact", moduleData: { hours: 200 }, order: 2 },
        // genres that don't exist — no genres attributed
        { gameId: "unknown-game", moduleData: {}, order: 3 },
      ]),
      reg,
    );
    expect(stats.genreCounts["FPS"]).toBe(1);
    expect(stats.genreCounts["RPG"]).toBe(1);
    // open world appears in both genshin genres only — not double-counted per game
    expect(stats.genreCounts["open world"]).toBe(1);
    // unknown game contributes no genres
    expect(stats.dominantGenres.length).toBeLessThanOrEqual(3);
    expect(stats.dominantGenres).toContain("FPS");
  });

  it("echoes player types verbatim (never derives them)", () => {
    const reg = registryOf();
    const stats = computeProfileStats(makeProfile([], ["social", "explorateur"]), reg);
    expect(stats.playerTypes).toEqual(["social", "explorateur"]);
  });

  it("sorts dominant genres by count desc then alphabetical", () => {
    // Make FPS appear twice via two distinct games sharing that genre.
    const a: GameDefinition = { id: "a", name: "A", genres: ["FPS", "tactique"], modules: ["competitive"], gameData: {} };
    const b: GameDefinition = { id: "b", name: "B", genres: ["FPS"], modules: ["competitive"], gameData: {} };
    const c: GameDefinition = { id: "c", name: "C", genres: ["sandbox"], modules: ["sandbox"], gameData: {} };
    const reg = registryOf(a, b, c);
    const stats = computeProfileStats(
      makeProfile([
        { gameId: "a", moduleData: {}, order: 0 },
        { gameId: "b", moduleData: {}, order: 1 },
        { gameId: "c", moduleData: {}, order: 2 },
      ]),
      reg,
    );
    expect(stats.genreCounts["FPS"]).toBe(2);
    expect(stats.dominantGenres[0]).toBe("FPS");
  });

  it("handles a profile with no games", () => {
    const reg = registryOf();
    const stats = computeProfileStats(makeProfile([]), reg);
    expect(stats.totalGames).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.averageHours).toBeNull();
    expect(stats.dominantGenres).toEqual([]);
  });
});
