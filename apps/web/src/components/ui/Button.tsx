"use client";

import { forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Button — the single button primitive. Variants map to the design-system
 * component classes (`btn-primary` / `btn-ghost` / `btn-danger`) so every CTA
 * across the app stays visually consistent. Sizes are additive overrides.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...rest },
  ref,
) {
  const variantClass =
    variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : "btn-ghost";
  return (
    <button
      ref={ref}
      className={`btn ${variantClass} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
