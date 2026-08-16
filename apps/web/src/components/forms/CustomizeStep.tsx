"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { TemplateGallery } from "@/components/preview/TemplateGallery";
import { Field, Fieldset, Select, IconButton } from "@/components/ui";
import { CV_SECTIONS, type CVSectionId, type ThemeConfig } from "@gamer-cv/types";

/** All canonical sections in the user's chosen order, INCLUDING hidden ones
 *  (so the editor can show/toggle them). The templates' `resolveSectionOrder`
 *  filters hidden out for actual rendering; this is the editor-facing counterpart. */
function buildDisplayOrder(theme: ThemeConfig): CVSectionId[] {
  const validIds = CV_SECTIONS.map((s) => s.id);
  const valid = new Set<string>(validIds);
  const ordered = (theme.sectionOrder ?? validIds).filter((id) => valid.has(id));
  for (const id of validIds) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered as CVSectionId[];
}

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
        <p className="mt-1 text-xs text-content-muted">
          Changer de template ne modifie que l&apos;enveloppe visuelle, jamais les données affichées.
        </p>
        <div className="mt-3">
          <TemplateGallery value={theme.templateId} onSelect={setTemplate} />
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
      <div className="surface-2 p-4">
        <h3 className="mb-1 text-sm font-semibold text-content-secondary">Sections du profil</h3>
        <p className="mb-3 text-xs text-content-muted">
          Réordonne et masque les blocs. L'en-tête (identité) reste toujours visible.
        </p>
        <SectionOrderEditor
          order={buildDisplayOrder(theme)}
          hidden={new Set(theme.hiddenSections ?? [])}
          onChange={(order, hidden) =>
            setTheme({
              sectionOrder: order.length === CV_SECTIONS.length ? order : undefined,
              hiddenSections: hidden.size === 0 ? undefined : [...hidden],
            })
          }
        />
      </div>
    </Fieldset>
  );
}

/** Reorderable, toggleable section list. Up/down moves an id within `order`;
 *  the checkbox toggles membership in `hidden`. The caller persists the result. */
function SectionOrderEditor({
  order,
  hidden,
  onChange,
}: {
  order: CVSectionId[];
  hidden: Set<string>;
  onChange: (order: CVSectionId[], hidden: Set<string>) => void;
}) {
  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next, hidden);
  }
  function toggle(id: CVSectionId) {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(order, next);
  }
  // Show every canonical section; hidden ones stay in their ordered position so
  // re-enabling them reappears where the user expects.
  return (
    <ul className="space-y-1.5">
      {order.map((id, i) => {
        const meta = CV_SECTIONS.find((s) => s.id === id);
        const isHidden = hidden.has(id);
        return (
          <li
            key={id}
            className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition ${
              isHidden
                ? "border-line opacity-50"
                : "border-line-strong bg-surface"
            }`}
          >
            <label className="flex flex-1 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={!isHidden}
                onChange={() => toggle(id)}
                className="accent-[var(--color-accent)]"
                aria-label={`Afficher la section ${meta?.label ?? id}`}
              />
              <span className={isHidden ? "line-through" : ""}>{meta?.label ?? id}</span>
            </label>
            <IconButton
              icon={ChevronUp}
              label={`Monter ${meta?.label ?? id}`}
              size="sm"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            />
            <IconButton
              icon={ChevronDown}
              label={`Descendre ${meta?.label ?? id}`}
              size="sm"
              disabled={i === order.length - 1}
              onClick={() => move(i, 1)}
            />
          </li>
        );
      })}
    </ul>
  );
}
