import { describe, it, expect } from "vitest";
import { resolveFieldOptions } from "@/lib/games";
import { isRetryable } from "@/lib/generation";
import { GenerationFormatError } from "@gamer-cv/core";
import { z } from "zod";
import type { FieldDescriptor, GameDefinition } from "@gamer-cv/types";

function game(gameData: Record<string, unknown>): GameDefinition {
  return {
    id: "test",
    name: "Test",
    genres: ["x"],
    platforms: ["PC"],
    modules: [],
    gameData,
  } as GameDefinition;
}

const field = (over: Partial<FieldDescriptor> = {}): FieldDescriptor =>
  ({
    key: "k",
    label: "K",
    type: "select",
    optionsSource: "game.ranks",
    ...over,
  }) as FieldDescriptor;

describe("resolveFieldOptions — empty/missing gameData falls back to undefined", () => {
  it("returns inline options when present", () => {
    expect(
      resolveFieldOptions(game({}), field({ options: ["a", "b"], optionsSource: undefined })),
    ).toEqual(["a", "b"]);
  });

  it("returns the array when gameData has a populated list", () => {
    expect(resolveFieldOptions(game({ ranks: ["Or", "Argent"] }), field())).toEqual([
      "Or",
      "Argent",
    ]);
  });

  it("returns undefined when the gameData list is EMPTY (free-text fallback)", () => {
    // An empty array used to leak through as [] → dead dropdown. Now it must
    // collapse to undefined so the form renders a usable free-text input.
    expect(resolveFieldOptions(game({ ranks: [] }), field())).toBeUndefined();
  });

  it("returns undefined when the gameData key is missing", () => {
    expect(resolveFieldOptions(game({}), field())).toBeUndefined();
  });

  it("returns undefined when the gameData value is not an array", () => {
    expect(resolveFieldOptions(game({ ranks: "Or" }), field())).toBeUndefined();
  });
});

describe("isRetryable — only malformed-JSON errors retry", () => {
  it("retries on GenerationFormatError (schema mismatch)", () => {
    expect(isRetryable(new GenerationFormatError(new z.ZodError([])))).toBe(true);
  });

  it("retries on SyntaxError (JSON.parse failure / truncation)", () => {
    expect(isRetryable(new SyntaxError("Unexpected token } in JSON"))).toBe(true);
  });

  it("retries on 'no JSON object found' (prose reply)", () => {
    expect(isRetryable(new Error("no JSON object found in response"))).toBe(true);
  });

  it("does NOT retry on auth / network / unknown errors", () => {
    expect(isRetryable(new Error("401 Unauthorized"))).toBe(false);
    expect(isRetryable(new Error("fetch failed"))).toBe(false);
    expect(isRetryable(new Error("rate_limit_error"))).toBe(false);
    expect(isRetryable("string")).toBe(false);
    expect(isRetryable(null)).toBe(false);
  });
});
