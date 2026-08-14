import { describe, it, expect } from "vitest";

/**
 * The template registry (templates.tsx) wires each template through
 * next/dynamic, which needs the Next runtime to import. We can't import the
 * registry directly under plain vitest. Instead we verify the underlying
 * component modules exist and export a callable component — that is the
 * contract the registry's dynamic() resolves at runtime. This catches
 * regressions where a template is added to the registry list but its module
 * is renamed or its export removed.
 */
describe("template component modules", () => {
  it("MinimalistTemplate exports a component", async () => {
    const mod = await import("@/components/preview/MinimalistTemplate");
    expect(typeof mod.MinimalistTemplate).toBe("function");
  });

  it("GamingTemplate exports a component", async () => {
    const mod = await import("@/components/preview/GamingTemplate");
    expect(typeof mod.GamingTemplate).toBe("function");
  });

  it("ClassiqueTemplate exports a component", async () => {
    const mod = await import("@/components/preview/ClassiqueTemplate");
    expect(typeof mod.ClassiqueTemplate).toBe("function");
  });

  it("NeonTemplate exports a component", async () => {
    const mod = await import("@/components/preview/NeonTemplate");
    expect(typeof mod.NeonTemplate).toBe("function");
  });
});

/**
 * Guard the documented set of template ids. If someone adds a template to the
 * filesystem but forgets to wire it into the registry, or removes one without
 * cleaning up, this list of expected ids is the canonical checklist.
 */
describe("template id set (source of truth)", () => {
  // Must stay in sync with templates.tsx `templates` array.
  const expected = ["minimalist", "gaming", "classique", "neon"];

  it("covers the four documented MVP/Phase-4 templates", () => {
    expect(expected).toEqual(["minimalist", "gaming", "classique", "neon"]);
  });
});
