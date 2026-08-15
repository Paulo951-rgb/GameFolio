import { describe, it, expect } from "vitest";
import {
  TEMPLATE_THEMES,
  TEMPLATE_THEME_MAP,
  resolveTemplateBackground,
} from "@/components/preview/template-themes";

/**
 * template-themes is a server-safe module (no "use client") — the single
 * source of truth for per-template default colors + the canvas-background
 * resolver used by the public /cv/[slug] page and the export render page.
 */
describe("TEMPLATE_THEMES", () => {
  it("covers the documented template ids", () => {
    const ids = TEMPLATE_THEMES.map((t) => t.id);
    expect(ids).toEqual(["minimalist", "gaming", "classique", "neon", "tech", "creator"]);
  });

  it("every theme has non-empty bg/primary/accent/text colors", () => {
    for (const t of TEMPLATE_THEMES) {
      expect(t.defaultTheme.bg).toBeTruthy();
      expect(t.defaultTheme.primary).toBeTruthy();
      expect(t.defaultTheme.accent).toBeTruthy();
      expect(t.defaultTheme.text).toBeTruthy();
    }
  });

  it("TEMPLATE_THEME_MAP mirrors the array", () => {
    for (const t of TEMPLATE_THEMES) {
      expect(TEMPLATE_THEME_MAP.get(t.id)).toBe(t);
    }
  });
});

describe("resolveTemplateBackground", () => {
  it("returns the template default background when no override is set", () => {
    expect(resolveTemplateBackground({ templateId: "minimalist" })).toBe("#0f172a");
    // Classique is the only light template — its canvas must be white, not the
    // global dark bg (a white CV on a dark page would look floaty).
    expect(resolveTemplateBackground({ templateId: "classique" })).toBe("#ffffff");
  });

  it("honours a user backgroundColor override over the template default", () => {
    expect(
      resolveTemplateBackground({ templateId: "minimalist", backgroundColor: "#111111" }),
    ).toBe("#111111");
  });

  it("falls back to the first theme for an unknown template id", () => {
    expect(resolveTemplateBackground({ templateId: "does-not-exist" })).toBe(
      TEMPLATE_THEMES[0].defaultTheme.bg,
    );
  });
});
