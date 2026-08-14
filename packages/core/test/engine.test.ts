/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  defineModule,
  defineGame,
  composeSchemas,
  mergeFields,
  resolveGame,
  resolveGameSchema,
  validateGameEntry,
} from "../src/modules/index.js";
import {
  filterRecord,
  filterGameEntry,
  resolveVisibility,
} from "../src/visibility/index.js";
import {
  serializeProfile,
  verifyFacts,
  SYSTEM_PROMPT,
  runGeneration,
  GenerationFormatError,
} from "../src/generation/index.js";
import { TemplateRegistry } from "../src/templates/index.js";
import type {
  AIProvider,
  GameDefinition,
  ModuleDefinition,
} from "@gamer-cv/types";

describe("defineModule", () => {
  it("creates a module with default schemaVersion 1", () => {
    const mod = defineModule({
      id: "x",
      schema: z.object({ a: z.string() }),
      fields: [{ key: "a", label: "A", type: "text" }],
    });
    expect(mod.id).toBe("x");
    expect(mod.schemaVersion).toBe(1);
  });

  it("rejects a module with zero fields", () => {
    expect(() =>
      defineModule({ id: "x", schema: z.object({}), fields: [] }),
    ).toThrow();
  });
});

describe("defineGame", () => {
  it("rejects a game with no modules", () => {
    expect(() =>
      defineGame({
        id: "x",
        name: "X",
        genres: [],
        modules: [],
        gameData: {},
      }),
    ).toThrow();
  });

  it("rejects a game missing id or name", () => {
    expect(() =>
      defineGame({
        id: "",
        name: "X",
        genres: [],
        modules: ["a"],
        gameData: {},
      }),
    ).toThrow();
  });
});

describe("composeSchemas", () => {
  it("merges multiple module shapes into one object schema", () => {
    const a = defineModule({
      id: "a",
      schema: z.object({ rank: z.string().optional() }),
      fields: [{ key: "rank", label: "R", type: "text" }],
    });
    const b = defineModule({
      id: "b",
      schema: z.object({ hours: z.number().optional() }),
      fields: [{ key: "hours", label: "H", type: "number" }],
    });
    const composite = composeSchemas([a, b]);
    expect(composite.shape).toHaveProperty("rank");
    expect(composite.shape).toHaveProperty("hours");
    expect(composite.safeParse({ rank: "Or", hours: 10 }).success).toBe(true);
  });

  it("rejects ambiguous overlapping field keys across modules", () => {
    const a = defineModule({
      id: "a",
      schema: z.object({ shared: z.string().optional() }),
      fields: [{ key: "shared", label: "S", type: "text" }],
    });
    const b = defineModule({
      id: "b",
      schema: z.object({ shared: z.string().optional() }),
      fields: [{ key: "shared", label: "S", type: "text" }],
    });
    expect(() => composeSchemas([a, b])).toThrow(/ambiguous/);
  });

  it("rejects a non-z.object schema (module must be composable)", () => {
    const bad = {
      id: "bad",
      schema: z.string(),
      fields: [{ key: "x", label: "X", type: "text" }],
      schemaVersion: 1,
    } as unknown as ModuleDefinition;
    expect(() => composeSchemas([bad])).toThrow(/z\.object/);
  });
});

describe("mergeFields", () => {
  it("preserves module then field order", () => {
    const a = defineModule({
      id: "a",
      schema: z.object({ x: z.string().optional() }),
      fields: [
        { key: "x", label: "X", type: "text" },
        { key: "y", label: "Y", type: "text" },
      ],
    });
    const b = defineModule({
      id: "b",
      schema: z.object({ z: z.string().optional() }),
      fields: [{ key: "z", label: "Z", type: "text" }],
    });
    expect(mergeFields([a, b]).map((f) => f.key)).toEqual(["x", "y", "z"]);
  });
});

describe("resolveGame", () => {
  const mod = defineModule({
    id: "m",
    schema: z.object({ rank: z.string().optional() }),
    fields: [{ key: "rank", label: "Rang", type: "text" }],
  });
  const modReg = new Map([["m", mod]]);
  const game: GameDefinition = {
    id: "g",
    name: "Game",
    genres: ["x"],
    modules: ["m"],
    gameData: {},
  };

  it("resolves modules and builds the composite schema", () => {
    const resolved = resolveGame(game, modReg);
    expect(resolved.modules).toHaveLength(1);
    expect(resolved.compositeSchema.shape).toHaveProperty("rank");
  });

  it("throws when a game references an unknown module", () => {
    expect(() =>
      resolveGame(
        { ...game, modules: ["nope"] },
        modReg,
      ),
    ).toThrow(/unknown module/);
  });
});

describe("resolveGameSchema", () => {
  it("returns null for an unknown game id (user input)", () => {
    const emptyGames = new Map<string, GameDefinition>();
    const emptyMods = new Map<string, ModuleDefinition>();
    expect(resolveGameSchema("ghost", emptyGames, emptyMods)).toBeNull();
  });
});

describe("validateGameEntry", () => {
  const mod = defineModule({
    id: "m",
    schema: z.object({ rank: z.string().optional(), hours: z.number().optional() }),
    fields: [{ key: "rank", label: "Rang", type: "text" }],
  });
  const modReg = new Map([["m", mod]]);
  const games = new Map<string, GameDefinition>([
    ["g", { id: "g", name: "Game", genres: [], modules: ["m"], gameData: {} }],
  ]);

  it("accepts valid module data", () => {
    const res = validateGameEntry("g", { rank: "Or", hours: 10 }, games, modReg);
    expect(res.success).toBe(true);
  });

  it("reports structured errors on bad types without throwing", () => {
    const res = validateGameEntry("g", { hours: "not-a-number" }, games, modReg);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.path.includes("hours"))).toBe(true);
    }
  });

  it("reports an unknown game id", () => {
    const res = validateGameEntry("ghost", {}, games, modReg);
    expect(res.success).toBe(false);
  });
});

describe("visibility engine", () => {
  it("defaults to visible when key is absent", () => {
    expect(resolveVisibility(undefined, "any")).toBe("visible");
  });

  it("filterRecord keeps only visible keys", () => {
    const out = filterRecord(
      { a: 1, b: 2, c: 3 },
      { a: "visible", b: "hidden", c: "private" },
    );
    expect(out).toEqual({ a: 1 });
  });

  it("withholds private fields just like hidden fields", () => {
    expect(
      filterRecord({ a: 1, b: 2 }, { a: "visible", b: "private" }),
    ).toEqual({ a: 1 });
  });

  it("drops a game entry whose fields are all hidden/private", () => {
    const entry = { gameId: "g", moduleData: { a: 1 }, order: 0 };
    expect(
      filterGameEntry(entry, { a: "hidden" }),
    ).toBeNull();
  });

  it("keeps a game entry that still has visible data", () => {
    const entry = { gameId: "g", moduleData: { a: 1, b: 2 }, order: 0 };
    const out = filterGameEntry(entry, { a: "hidden" });
    expect(out?.moduleData).toEqual({ b: 2 });
  });
});

describe("generation pipeline", () => {
  it("SYSTEM_PROMPT explicitly forbids inventing facts", () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain("n'invente");
  });

  it("serializeProfile drops empty values (no empties to complete)", () => {
    const out = serializeProfile({
      gamerTag: "Nova",
      age: undefined,
      socials: { discord: "", twitch: "nova" },
      games: [{ gameId: "g", moduleData: { rank: "Or", hours: undefined } }],
    });
    expect(out).toEqual({
      gamerTag: "Nova",
      socials: { twitch: "nova" },
      games: [{ gameId: "g", moduleData: { rank: "Or" } }],
    });
  });

  it("verifyFacts flags numbers absent from the input", () => {
    const gen = {
      summary: "Joueur avec 250 heures et rang Immortel.",
      strengths: [],
      perGame: {},
    };
    const flagged = verifyFacts(gen, { hours: 100 } as never);
    // "250" is not in the input blob ("100") — should be flagged.
    expect(flagged).toContain("250");
  });

  it("runGeneration parses structured output and flags facts", async () => {
    const provider: AIProvider = {
      async generate() {
        return {
          structured: {
            summary: "Nova, rang Or, 100 heures.",
            strengths: ["Réactif"],
            perGame: { valorant: "Main Jett, rang Or." },
          },
          raw: "...",
        };
      },
    };
    const { text, flaggedFacts } = await runGeneration(provider, {
      systemPrompt: SYSTEM_PROMPT,
      profileData: { hours: 100, rank: "Or", main: "Jett" },
    });
    expect(text.summary).toContain("Or");
    // "100" and "Or" and "Jett" are present in input → not flagged.
    expect(flaggedFacts).not.toContain("100");
  });

  it("runGeneration throws GenerationFormatError on bad shape", async () => {
    const provider: AIProvider = {
      async generate() {
        return { structured: { nope: true } }; // missing required fields
      },
    };
    await expect(
      runGeneration(provider, {
        systemPrompt: SYSTEM_PROMPT,
        profileData: {},
      }),
    ).rejects.toBeInstanceOf(GenerationFormatError);
  });
});

describe("TemplateRegistry", () => {
  it("registers and retrieves templates", () => {
    const reg = new TemplateRegistry();
    reg.register({
      id: "minimal",
      name: "Minimaliste",
      defaultTheme: { templateId: "minimal" },
    });
    expect(reg.get("minimal")?.name).toBe("Minimaliste");
    expect(reg.has("neon")).toBe(false);
  });

  it("rejects duplicate template ids", () => {
    const reg = new TemplateRegistry();
    reg.register({
      id: "minimal",
      name: "Minimaliste",
      defaultTheme: { templateId: "minimal" },
    });
    expect(() =>
      reg.register({
        id: "minimal",
        name: "Autre",
        defaultTheme: { templateId: "minimal" },
      }),
    ).toThrow();
  });
});
