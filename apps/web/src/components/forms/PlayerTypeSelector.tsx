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
            className={`rounded-lg border p-3 text-left transition ${
              active
                ? "border-violet-500 bg-violet-600/20"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            <div className="font-semibold">{t.label}</div>
            <div className="mt-0.5 text-xs text-slate-400">{t.description}</div>
          </button>
        );
      })}
    </div>
  );
}
