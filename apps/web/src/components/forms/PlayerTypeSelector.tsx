"use client";

import { PLAYER_TYPES } from "@/lib/games";

/**
 * PlayerTypeSelector — multi-select over a small Bartle-inspired taxonomy.
 * Writes directly to the editor store.
 */
interface PlayerTypeSelectorProps {
  selected: string[];
  onChange: (types: string[]) => void;
}

export function PlayerTypeSelector({ selected, onChange }: PlayerTypeSelectorProps) {
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((t) => t !== id)
        : [...selected, id],
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PLAYER_TYPES.map((t) => {
        const active = selected.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            aria-pressed={active}
            className={`rounded-lg border p-3 text-left transition ${
              active
                ? "border-accent bg-accent/15 text-accent"
                : "border-line bg-surface hover:border-line-strong"
            }`}
          >
            <div className="font-semibold text-content-primary">{t.label}</div>
            <div className="mt-0.5 text-xs text-content-muted">{t.description}</div>
          </button>
        );
      })}
    </div>
  );
}
