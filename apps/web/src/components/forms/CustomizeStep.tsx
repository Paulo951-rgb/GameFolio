"use client";

import { useEditorStore } from "@/lib/store";

const TEMPLATES = [
  { id: "minimalist", label: "Minimaliste" },
];
const DENSITIES = ["compact", "normal", "spacious"] as const;

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
          Choisissez l’apparence de votre CV. D’autres templates arrivent en phase 4.
        </p>
      </div>

      <div>
        <span className={labelClass}>Template</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {TEMPLATES.map((t) => (
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

      <div className="grid grid-cols-2 gap-4">
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
          <span className={labelClass}>Couleur de fond</span>
          <input
            type="color"
            value={theme.backgroundColor ?? "#0f172a"}
            onChange={(e) => setTheme({ backgroundColor: e.target.value })}
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900"
          />
        </label>
      </div>

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
  );
}
