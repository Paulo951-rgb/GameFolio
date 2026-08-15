import type { ReactNode } from "react";

/**
 * Field primitives — label + control wrapper + helper/error text. Keeps form
 * spacing and labelling consistent across the wizard. The control itself is
 * passed as children (an input/select using the `.field` class, or a custom
 * widget) so this stays presentation-only and input-agnostic.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-content-secondary">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-content-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Fieldset({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
