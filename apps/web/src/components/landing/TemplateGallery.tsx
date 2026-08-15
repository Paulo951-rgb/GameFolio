"use client";

import { templates } from "@/components/preview/templates";

/**
 * TemplateGallery — landing section showcasing the available templates as
 * mini visual swatches. Reads the shared registry (single source of truth) so
 * it never drifts from what the editor actually offers.
 */
export function TemplateGallery() {
  return (
    <div id="templates" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {templates.map((t, i) => (
        <div
          key={t.id}
          className="surface group animate-rise p-4 transition hover:-translate-y-1 hover:border-line-strong"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <TemplateSwatch id={t.id} />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-content-primary">{t.label}</span>
            <span className="text-[10px] text-content-muted">template</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A tiny abstract preview of each template's color/structure identity. */
function TemplateSwatch({ id }: { id: string }) {
  const palettes: Record<string, { bg: string; accent: string; shape: "bar" | "block" | "neon" }> = {
    minimalist: { bg: "#0f172a", accent: "#8b5cf6", shape: "bar" },
    gaming: { bg: "#020617", accent: "#22d3ee", shape: "block" },
    classique: { bg: "#ffffff", accent: "#1e293b", shape: "bar" },
    neon: { bg: "#0a0118", accent: "#d946ef", shape: "neon" },
    tech: { bg: "#0a0e1a", accent: "#3ddc97", shape: "block" },
    creator: { bg: "#160a14", accent: "#fb7185", shape: "neon" },
  };
  const p = palettes[id] ?? palettes.minimalist;
  return (
    <div
      className="relative h-20 overflow-hidden rounded-md"
      style={{ backgroundColor: p.bg }}
    >
      <div
        className="absolute left-3 top-3 h-2 w-12 rounded-full"
        style={{ backgroundColor: p.accent }}
      />
      <div className="absolute left-3 top-7 h-1.5 w-20 rounded-full bg-white/20" />
      <div className="absolute left-3 top-10 h-1.5 w-16 rounded-full bg-white/10" />
      {p.shape === "block" && (
        <div
          className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded text-[10px] font-black text-white"
          style={{ backgroundColor: p.accent }}
        >
          G
        </div>
      )}
      {p.shape === "neon" && (
        <div
          className="absolute bottom-3 left-3 text-[10px] font-bold"
          style={{ color: p.accent, textShadow: `0 0 8px ${p.accent}` }}
        >
          ▸ GAMER
        </div>
      )}
    </div>
  );
}
