import type { ReactNode } from "react";

type Surface = "default" | "2" | "elevated";

/**
 * Card — consistent surface container with optional hover lift. Maps to the
 * design-system surface classes so padding/border/glow stay uniform.
 */
export function Card({
  children,
  surface = "default",
  hover = false,
  className = "",
  ...rest
}: {
  children: ReactNode;
  surface?: Surface;
  hover?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const surfaceClass =
    surface === "elevated" ? "surface-elevated" : surface === "2" ? "surface-2" : "surface";
  const hoverClass = hover
    ? "transition transition-duration-200 hover:-translate-y-0.5 hover:border-line-strong"
    : "";
  return (
    <div className={`${surfaceClass} ${hoverClass} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-content-primary sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-content-secondary">{description}</p>
      )}
    </div>
  );
}
