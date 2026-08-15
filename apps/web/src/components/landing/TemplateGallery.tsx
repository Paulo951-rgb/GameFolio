"use client";

import { templates } from "@/components/preview/templates";
import { CVTemplate } from "@/components/preview/templates";
import { demoProfile, defaultThemeFor } from "./demo-data";

/**
 * TemplateGallery — landing section showcasing the available templates as REAL
 * mini renders (not abstract swatches). Each thumbnail renders the actual
 * CVTemplate component with clearly-labelled demo data + the template's own
 * default theme, scaled down inside an overflow-hidden box. Reads the shared
 * registry so it never drifts from what the editor offers.
 */
export function TemplateGallery() {
  return (
    <div id="templates" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {templates.map((t, i) => (
        <a
          key={t.id}
          href="/create"
          className="surface group animate-rise overflow-hidden p-0 transition hover:-translate-y-1 hover:border-line-strong"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <TemplateThumb id={t.id} />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-content-primary">{t.label}</span>
            <span className="text-[10px] text-content-muted">template</span>
          </div>
        </a>
      ))}
    </div>
  );
}

/** Real, scaled-down render of a template with demo data. The CV is rendered
 *  at its natural width then scaled to fit the thumbnail box; overflow is
 *  clipped so only the top portion shows (header + first sections). */
function TemplateThumb({ id }: { id: string }) {
  const theme = defaultThemeFor(id);
  return (
    <div className="pointer-events-none relative h-44 overflow-hidden bg-surface-2">
      <div
        className="absolute left-1/2 top-0 origin-top"
        style={{ transform: "translateX(-50%) scale(0.42)", transformOrigin: "top center", width: "210mm" }}
      >
        <CVTemplate data={demoProfile} theme={theme} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface-2 to-transparent" />
    </div>
  );
}
