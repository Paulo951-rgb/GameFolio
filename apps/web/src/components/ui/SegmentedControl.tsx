"use client";

import type { LucideIcon } from "lucide-react";

/**
 * SegmentedControl — accessible single-select toggle group rendered as a pill
 * rail (device toggle, density, visibility). Uses radiogroup semantics: one
 * option active at a time, keyboard reachable. Backed by the `.segmented`
 * design-system classes so every group looks identical.
 */
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className = "",
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`segmented ${size === "sm" ? "text-xs" : ""} ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="segmented-item"
            data-active={active || undefined}
          >
            {Icon ? <Icon size={size === "sm" ? 13 : 15} aria-hidden /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
