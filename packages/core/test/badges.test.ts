/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { computeBadges, allBadges } from "../src/badges/index.js";
import type {
  GamerProfile,
  GameDefinition,
  GameRegistry,
  Achievement,
} from "@gamer-cv/types";

function makeProfile(
  games: GamerProfile["games"],
  opts: { playerTypes?: string[]; achievements?: Achievement[] } = {},
): GamerProfile {
  return {
    id: "p1",
    personalInfo: { gamerTag: "X", visibility: {} },
    playerTypes: opts.playerTypes ?? [],
    games,
    achievements: opts.achievements ?? [],
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
  genres: ["FPS", "Compétitif"],
  modules: ["competitive"],
  gameData: {},
};
const minecraft: GameDefinition = {
  id: "minecraft",
  name: "Minecraft",
  genres: ["sandbox", "créatif"],
  modules: ["sandbox"],
  gameData: {},
};
const rocketLeague: GameDefinition = {
  id: "rocket-league",
  name: "Rocket League",
  genres: ["Sports"],
  modules: ["competitive"],
  gameData: {},
};

describe("computeBadges — never attributes a badge whose condition isn't met", () => {
  it("returns NO badges for an empty profile", () => {
    const badges = computeBadges(makeProfile([]), registryOf(valorant));
    expect(badges).toHaveLength(0);
  });

  it("earns 'multigame' with 3+ games and 'collector' with 5+", () => {
    const reg = registryOf(valorant, minecraft, rocketLeague);
    const b3 = computeBadges(
      makeProfile([
        { gameId: "valorant", moduleData: {}, order: 0 },
        { gameId: "minecraft", moduleData: {}, order: 1 },
        { gameId: "rocket-league", moduleData: {}, order: 2 },
      ]),
      reg,
    );
    expect(b3.map((b) => b.id)).toContain("multigame");
    expect(b3.map((b) => b.id)).not.toContain("collector");
  });

  it("earns volume badges from REAL hours only (no fabrication)", () => {
    const reg = registryOf(valorant, minecraft);
    const badges = computeBadges(
      makeProfile([
        { gameId: "valorant", moduleData: { hours: 800 }, order: 0 },
        { gameId: "minecraft", moduleData: { hours: 300 }, order: 1 },
      ]),
      reg,
    );
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("five-hundred-hours"); // 1100 >= 500
    expect(ids).toContain("thousand-hours"); // 1100 >= 1000
  });

  it("does NOT earn a volume badge when hours are below the threshold", () => {
    const reg = registryOf(valorant);
    const badges = computeBadges(
      makeProfile([{ gameId: "valorant", moduleData: { hours: 120 }, order: 0 }]),
      reg,
    );
    expect(badges.map((b) => b.id)).not.toContain("five-hundred-hours");
    expect(badges.map((b) => b.id)).not.toContain("thousand-hours");
  });

  it("earns 'competitive' + 'peak-ranked' from real ranks", () => {
    const reg = registryOf(valorant);
    const badges = computeBadges(
      makeProfile([
        {
          gameId: "valorant",
          moduleData: { currentRank: "Or", highestRank: "Diamant" },
          order: 0,
        },
      ]),
      reg,
    );
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("competitive");
    expect(ids).toContain("peak-ranked");
  });

  it("earns genre badges (FPS main / Builder) from the game registry genres", () => {
    const reg = registryOf(valorant, minecraft);
    const badges = computeBadges(
      makeProfile([
        { gameId: "valorant", moduleData: {}, order: 0 },
        { gameId: "minecraft", moduleData: {}, order: 1 },
      ]),
      reg,
    );
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("fps-main");
    expect(ids).toContain("sandbox-builder");
  });

  it("earns 'achievement-hunter' only with 3+ achievements", () => {
    const reg = registryOf();
    const two = computeBadges(
      makeProfile([], {
        achievements: [
          { id: "a1", title: "x" },
          { id: "a2", title: "y" },
        ],
      }),
      reg,
    );
    expect(two.map((b) => b.id)).not.toContain("achievement-hunter");
    const three = computeBadges(
      makeProfile([], {
        achievements: [
          { id: "a1", title: "x" },
          { id: "a2", title: "y" },
          { id: "a3", title: "z" },
        ],
      }),
      reg,
    );
    expect(three.map((b) => b.id)).toContain("achievement-hunter");
  });

  it("earns 'tournament-player' only when competitiveExperience is filled", () => {
    const reg = registryOf(valorant);
    const without = computeBadges(
      makeProfile([{ gameId: "valorant", moduleData: { currentRank: "Or" }, order: 0 }]),
      reg,
    );
    expect(without.map((b) => b.id)).not.toContain("tournament-player");
    const withExp = computeBadges(
      makeProfile([
        {
          gameId: "valorant",
          moduleData: { currentRank: "Or", competitiveExperience: "ESL 2024" },
          order: 0,
        },
      ]),
      reg,
    );
    expect(withExp.map((b) => b.id)).toContain("tournament-player");
  });
});

describe("allBadges", () => {
  it("returns the full catalogue (for locked previews)", () => {
    const all = allBadges();
    expect(all.length).toBeGreaterThan(5);
    expect(all.map((b) => b.id)).toContain("thousand-hours");
  });
});
