import type { ReactNode } from "react";

type Tone = "default" | "accent" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  default: "",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/**
 * Badge — small status pill (count, category, earned badge). Uses the `.chip`
 * base; tone tints the text. Keep it for non-interactive status, not actions.
 * `title` passes through as a native tooltip (earned-badge conditions, etc.).
 */
export function Badge({
  children,
  tone = "default",
  title,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  title?: string;
  className?: string;
}) {
  return <span title={title} className={`chip ${TONES[tone]} ${className}`}>{children}</span>;
}

/**
 * StatTile — a compact statistic card (label + big value + optional hint).
 * Used by dashboard/preview stats. Renders real values only — callers must
 * never pass fabricated numbers (anti-hallucination invariant).
 */
export function StatTile({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`surface-2 p-4 ${className}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-content-muted">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold text-content-primary">{value}</dd>
      {hint && <dd className="mt-0.5 text-[11px] text-warning">{hint}</dd>}
    </div>
  );
}
