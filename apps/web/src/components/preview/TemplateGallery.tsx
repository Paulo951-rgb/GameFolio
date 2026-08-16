"use client";

import { Check } from "lucide-react";
import { templates } from "./templates";
import { TEMPLATE_THEME_MAP } from "./template-themes";

/**
 * TemplateGallery — visual selection grid for the 6 CV templates (§10). Each
 * card renders a CSS-only mini-preview driven by the template's default theme
 * (no lazy component loaded here → keeps the gallery cheap and avoids the
 * export/preview WYSIWYG chunk dependencies). Selecting sets theme.templateId;
 * the user's color overrides are preserved (setTemplate keeps themeConfig).
 *
 * Selection state is unmistakable: a ring + check badge + "Sélectionné" label.
 */
export function TemplateGallery({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {templates.map((t) => {
        const theme = t.defaultTheme;
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            aria-pressed={active}
            className={`group relative overflow-hidden rounded-lg border text-left transition ${
              active
                ? "border-accent ring-2 ring-accent/40"
                : "border-line hover:border-line-strong"
            }`}
          >
            {/* Mini preview using the template's default theme */}
            <div
              className="relative h-24 w-full overflow-hidden"
              style={{ backgroundColor: theme.bg }}
            >
              <div className="absolute left-3 top-3 h-8 w-8 rounded-full" style={{ backgroundColor: theme.primary }} />
              <div className="absolute left-3 top-14 h-1.5 w-16 rounded-full" style={{ backgroundColor: theme.text, opacity: 0.85 }} />
              <div className="absolute left-3 top-[18px] h-1.5 w-10 rounded-full" style={{ backgroundColor: theme.accent }} />
              <div className="absolute left-3 bottom-3 space-y-1">
                <div className="h-1 w-20 rounded-full" style={{ backgroundColor: theme.text, opacity: 0.6 }} />
                <div className="h-1 w-14 rounded-full" style={{ backgroundColor: theme.text, opacity: 0.35 }} />
              </div>
              <div className="absolute right-3 top-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.7 }} />
              {active && (
                <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-white shadow">
                  <Check size={12} aria-hidden />
                </span>
              )}
            </div>
            <div className="p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-content-primary">{t.label}</span>
                <span className="chip text-[10px]">{t.style}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-content-muted">{t.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Resolve the human label for a template id (used by the public profile +
 *  dashboard headers). Falls back to the id when unknown. */
export function templateLabel(id: string): string {
  return TEMPLATE_THEME_MAP.get(id)?.label ?? id;
}
