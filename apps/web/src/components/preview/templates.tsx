"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { NormalizedCVData, ThemeConfig } from "@gamer-cv/types";
import { TEMPLATE_THEMES, type TemplateTheme } from "./template-themes";

/**
 * Template registry — the single source of truth mapping a templateId to its
 * label + lazy-loaded component. Both LivePreviewPane and the isolated /export
 * render page resolve through this, so what-you-see-is-what-you-export holds
 * for EVERY template, not just the default one (architecture §7, §8).
 *
 * Each template is a separate chunk (next/dynamic) so the initial bundle isn't
 * loaded with every template's code (architecture §2 code-splitting). The
 * dynamic imports use explicit static specifiers so webpack can create one
 * chunk per template (a computed specifier would defeat code-splitting).
 *
 * The per-template default theme colors live in ./template-themes.ts (a
 * server-safe module) so the public /cv/[slug] page + export route can resolve
 * a matching canvas background without importing this "use client" module.
 */

export interface TemplateDefinition extends TemplateTheme {
  component: ComponentType<{ data: NormalizedCVData; theme: ThemeConfig }>;
}

const loading = () => (
  <div className="py-12 text-center text-sm text-slate-500">Chargement du template…</div>
);

const COMPONENTS: Record<string, ComponentType<{ data: NormalizedCVData; theme: ThemeConfig }>> = {
  minimalist: dynamic(() => import("./MinimalistTemplate").then((m) => m.MinimalistTemplate), { ssr: true, loading }),
  gaming: dynamic(() => import("./GamingTemplate").then((m) => m.GamingTemplate), { ssr: true, loading }),
  classique: dynamic(() => import("./ClassiqueTemplate").then((m) => m.ClassiqueTemplate), { ssr: true, loading }),
  neon: dynamic(() => import("./NeonTemplate").then((m) => m.NeonTemplate), { ssr: true, loading }),
  tech: dynamic(() => import("./TechTemplate").then((m) => m.TechTemplate), { ssr: true, loading }),
  creator: dynamic(() => import("./CreatorTemplate").then((m) => m.CreatorTemplate), { ssr: true, loading }),
};

export const templates: TemplateDefinition[] = TEMPLATE_THEMES.map((t) => ({
  id: t.id,
  label: t.label,
  defaultTheme: t.defaultTheme,
  component: COMPONENTS[t.id],
}));

export const templateMap: ReadonlyMap<string, TemplateDefinition> = new Map(
  templates.map((t) => [t.id, t]),
);

/**
 * CVTemplate — renders the active template (from theme.templateId), falling
 * back to "minimalist" if the id is unknown. Used by every render surface.
 */
export function CVTemplate({
  data,
  theme,
}: {
  data: NormalizedCVData;
  theme: ThemeConfig;
}) {
  const def = templateMap.get(theme.templateId) ?? templates[0];
  const Template = def.component;
  return <Template data={data} theme={theme} />;
}
