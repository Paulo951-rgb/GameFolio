import type { LucideIcon } from "lucide-react";

/**
 * Skeleton — shimmering loading placeholder (§18). Use instead of "Chargement…"
 * text wherever content takes time to arrive. `lines` renders a stacked text
 * block; a `className` alone renders a custom-shaped block.
 */
export function Skeleton({
  className = "",
  lines,
}: {
  className?: string;
  lines?: number;
}) {
  if (lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-3.5"
            style={{ width: i === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    );
  }
  return <div className={`skeleton ${className}`} />;
}

/**
 * EmptyState — the single pattern for empty/incomplete surfaces (§17). Icon +
 * title + short explanation + optional action. Never looks like a broken page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-12 text-center ${className}`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-content-muted">
        <Icon size={22} aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-content-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-content-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

type AlertTone = "info" | "success" | "warning" | "danger";

const ALERT_STYLE: Record<AlertTone, { box: string; icon?: string }> = {
  info: { box: "border-accent/40 bg-accent/10 text-accent" },
  success: { box: "border-success/40 bg-success/10 text-success" },
  warning: { box: "border-warning/40 bg-warning/10 text-warning" },
  danger: { box: "border-danger/40 bg-danger/10 text-danger" },
};

/**
 * Alert — structured message block. For errors (§19) pass a `recovery` hint so
 * the message always tells the user what to do next. Never surface stack traces
 * to end users with this — keep technical detail in logs.
 */
export function Alert({
  tone = "info",
  title,
  children,
  recovery,
  className = "",
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  recovery?: string;
  className?: string;
}) {
  const { box } = ALERT_STYLE[tone];
  return (
    <div className={`rounded-md border p-3 text-sm ${box} ${className}`} role="alert">
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={title ? "mt-0.5 opacity-90" : "opacity-90"}>{children}</div>}
      {recovery && <p className="mt-1 text-xs opacity-80">{recovery}</p>}
    </div>
  );
}
