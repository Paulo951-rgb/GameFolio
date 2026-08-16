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
