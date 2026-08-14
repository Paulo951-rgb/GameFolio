"use client";

import { useEditorStore } from "@/lib/store";
import { templates } from "@/components/preview/templates";

const DENSITIES = ["compact", "normal", "spacious"] as const;
const FONTS = [
  { value: "Inter, sans-serif", label: "Inter (sans)" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia (serif)" },
  { value: "'JetBrains Mono', ui-monospace, monospace", label: "Mono" },
  { value: "system-ui, sans-serif", label: "Système" },
];

export function CustomizeStep() {
  const theme = useEditorStore((s) => s.profile.themeConfig);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const setTheme = useEditorStore((s) => s.setTheme);

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
  const labelClass = "block text-sm font-medium text-slate-300";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Personnalisation</h2>
        <p className="mt-1 text-sm text-slate-400">
          Choisissez l’apparence de votre CV. Changer de template ne modifie que l’enveloppe visuelle, jamais les données affichées.
        </p>
      </div>

      <div>
        <span className={labelClass}>Template</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                theme.templateId === t.id
                  ? "border-violet-500 bg-violet-600/20 text-violet-200"
                  : "border-slate-700 bg-slate-900 hover:border-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="block">
          <span className={labelClass}>Couleur principale</span>
          <input
            type="color"
            value={theme.primaryColor ?? "#8b5cf6"}
            onChange={(e) => setTheme({ primaryColor: e.target.value })}
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Couleur accent</span>
          <input
            type="color"
            value={theme.accentColor ?? "#8b5cf6"}
            onChange={(e) => setTheme({ accentColor: e.target.value })}
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Couleur de fond</span>
          <input
            type="color"
            value={theme.backgroundColor ?? "#0f172a"}
            onChange={(e) => setTheme({ backgroundColor: e.target.value })}
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Couleur du texte</span>
          <input
            type="color"
            value={theme.textColor ?? "#e2e8f0"}
            onChange={(e) => setTheme({ textColor: e.target.value })}
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Police</span>
          <select
            value={theme.fontFamily ?? FONTS[0].value}
            onChange={(e) => setTheme({ fontFamily: e.target.value })}
            className={inputClass}
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Densité</span>
          <select
            value={theme.density ?? "normal"}
            onChange={(e) => setTheme({ density: e.target.value as (typeof DENSITIES)[number] })}
            className={inputClass}
          >
            {DENSITIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
