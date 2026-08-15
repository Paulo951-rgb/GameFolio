"use client";

import { useEditorStore } from "@/lib/store";
import { templates } from "@/components/preview/templates";
import { Field, Fieldset, Select } from "@/components/ui";

const DENSITIES = ["compact", "normal", "spacious"] as const;
const FONTS = [
  { value: "Inter, sans-serif", label: "Inter (sans)" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia (serif)" },
  { value: "'JetBrains Mono', ui-monospace, monospace", label: "Mono" },
  { value: "system-ui, sans-serif", label: "Système" },
];

const colorInputClass =
  "mt-1 h-10 w-full cursor-pointer rounded-md border border-line bg-surface p-1";

export function CustomizeStep() {
  const theme = useEditorStore((s) => s.profile.themeConfig);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const setTheme = useEditorStore((s) => s.setTheme);

  return (
    <Fieldset>
      <div>
        <h2 className="text-lg font-semibold text-content-primary">Design</h2>
        <p className="mt-1 text-sm text-content-muted">
          Choisis l'apparence de ton profil. Changer de template ne modifie que l'enveloppe
          visuelle, jamais les données affichées.
        </p>
      </div>

      <div>
        <span className="block text-sm font-medium text-content-secondary">Template</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              aria-pressed={theme.templateId === t.id}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                theme.templateId === t.id
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Couleur principale">
          <input
            type="color"
            value={theme.primaryColor ?? "#8b5cf6"}
            onChange={(e) => setTheme({ primaryColor: e.target.value })}
            className={colorInputClass}
            aria-label="Couleur principale"
          />
        </Field>
        <Field label="Couleur accent">
          <input
            type="color"
            value={theme.accentColor ?? "#8b5cf6"}
            onChange={(e) => setTheme({ accentColor: e.target.value })}
            className={colorInputClass}
            aria-label="Couleur accent"
          />
        </Field>
        <Field label="Couleur de fond">
          <input
            type="color"
            value={theme.backgroundColor ?? "#0f172a"}
            onChange={(e) => setTheme({ backgroundColor: e.target.value })}
            className={colorInputClass}
            aria-label="Couleur de fond"
          />
        </Field>
        <Field label="Couleur du texte">
          <input
            type="color"
            value={theme.textColor ?? "#e2e8f0"}
            onChange={(e) => setTheme({ textColor: e.target.value })}
            className={colorInputClass}
            aria-label="Couleur du texte"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Police">
          <Select
            value={theme.fontFamily ?? FONTS[0].value}
            onChange={(e) => setTheme({ fontFamily: e.target.value })}
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Densité">
          <Select
            value={theme.density ?? "normal"}
            onChange={(e) => setTheme({ density: e.target.value as (typeof DENSITIES)[number] })}
          >
            {DENSITIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Fieldset>
  );
}
