import { describe, it, expect } from "vitest";
import {
  spacing,
  resolveColors,
  resolveFont,
  formatLabel,
  formatValue,
} from "@/components/preview/template-utils";
import type { ThemeConfig } from "@gamer-cv/types";

const baseTheme: ThemeConfig = { templateId: "minimalist" };

describe("template-utils", () => {
  describe("spacing", () => {
    it("uses compact spacing for compact density", () => {
      const s = spacing({ ...baseTheme, density: "compact" });
      expect(s.page).toBe("p-4");
      expect(s.section).toBe("mb-3");
      expect(s.text).toBe("text-xs");
    });

    it("uses spacious spacing for spacious density", () => {
      const s = spacing({ ...baseTheme, density: "spacious" });
      expect(s.page).toBe("p-12");
      expect(s.section).toBe("mb-8");
      expect(s.text).toBe("text-base");
    });

    it("defaults to normal when density is absent", () => {
      const s = spacing(baseTheme);
      expect(s.page).toBe("p-8");
      expect(s.section).toBe("mb-5");
      expect(s.text).toBe("text-sm");
    });
  });

  describe("resolveColors", () => {
    it("returns theme colors when set", () => {
      const c = resolveColors(
        { ...baseTheme, primaryColor: "#ff0000", accentColor: "#00ff00", backgroundColor: "#000000", textColor: "#ffffff" },
        { primary: "#111111", accent: "#222222", bg: "#333333", text: "#444444" },
      );
      expect(c.primary).toBe("#ff0000");
      expect(c.accent).toBe("#00ff00");
      expect(c.bg).toBe("#000000");
      expect(c.text).toBe("#ffffff");
    });

    it("falls back to template defaults when unset", () => {
      const c = resolveColors(baseTheme, {
        primary: "#111111",
        accent: "#222222",
        bg: "#333333",
        text: "#444444",
      });
      expect(c).toEqual({
        primary: "#111111",
        accent: "#222222",
        bg: "#333333",
        text: "#444444",
      });
    });
  });

  describe("resolveFont", () => {
    it("returns the theme font when set", () => {
      expect(resolveFont({ ...baseTheme, fontFamily: "Comic Sans" }, "fallback")).toBe("Comic Sans");
    });
    it("falls back when unset", () => {
      expect(resolveFont(baseTheme, "fallback")).toBe("fallback");
    });
  });

  describe("formatLabel", () => {
    it("humanizes camelCase keys", () => {
      expect(formatLabel("currentRank")).toBe("Current Rank");
      expect(formatLabel("highestRank")).toBe("Highest Rank");
    });
    it("capitalizes a single lowercase word", () => {
      expect(formatLabel("hours")).toBe("Hours");
    });
  });

  describe("formatValue", () => {
    it("joins arrays with commas", () => {
      expect(formatValue(["Duelliste", "Sentinelle"])).toBe("Duelliste, Sentinelle");
    });
    it("renders null/empty as an em dash", () => {
      expect(formatValue(null)).toBe("—");
      expect(formatValue("")).toBe("—");
      expect(formatValue(undefined)).toBe("—");
    });
    it("stringifies numbers and strings", () => {
      expect(formatValue(350)).toBe("350");
      expect(formatValue("Diamant")).toBe("Diamant");
    });
    it("renders NaN (empty number input) as an em dash, not 'NaN'", () => {
      expect(formatValue(NaN)).toBe("—");
    });
  });
});
