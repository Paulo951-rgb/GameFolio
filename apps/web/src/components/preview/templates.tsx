"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { NormalizedCVData, ThemeConfig } from "@gamer-cv/types";

/**
 * Template registry — the single source of truth mapping a templateId to its
 * label + lazy-loaded component. Both LivePreviewPane and the isolated /export
 * render page resolve through this, so what-you-see-is-what-you-export holds
 * for EVERY template, not just the default one (architecture §7, §8).
 *
 * Each template is a separate chunk (next/dynamic) so the initial bundle isn't
 * loaded with every template's code (architecture §2 code-splitting).
 */

export interface TemplateDefinition {
  id: string;
  label: string;
  component: ComponentType<{ data: NormalizedCVData; theme: ThemeConfig }>;
}

const loading = () => (
  <div className="py-12 text-center text-sm text-slate-500">Chargement du template…</div>
);

export const templates: TemplateDefinition[] = [
  {
    id: "minimalist",
    label: "Minimaliste",
    component: dynamic(() => import("./MinimalistTemplate").then((m) => m.MinimalistTemplate), {
      ssr: true,
      loading,
    }),
  },
  {
    id: "gaming",
    label: "Gaming",
    component: dynamic(() => import("./GamingTemplate").then((m) => m.GamingTemplate), {
      ssr: true,
      loading,
    }),
  },
  {
    id: "classique",
    label: "Classique",
    component: dynamic(() => import("./ClassiqueTemplate").then((m) => m.ClassiqueTemplate), {
      ssr: true,
      loading,
    }),
  },
  {
    id: "neon",
    label: "Néon",
    component: dynamic(() => import("./NeonTemplate").then((m) => m.NeonTemplate), {
      ssr: true,
      loading,
    }),
  },
];

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
