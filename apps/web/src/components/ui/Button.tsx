"use client";

import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Show a spinner and disable interaction. Height stays stable (§9/§18). */
  loading?: boolean;
  /** Optional leading icon (lucide) — single icon system across the app. */
  icon?: LucideIcon;
}

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
};

/**
 * Button — the single button primitive. Variants map to the design-system
 * component classes so every CTA stays visually consistent. `loading` overlays
 * a spinner without changing the button's size. `icon` renders a lucide glyph
 * before the label so the whole app uses ONE icon system.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon: Icon,
    className = "",
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      data-loading={loading || undefined}
      className={`btn ${VARIANT_CLASS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {Icon ? <Icon size={size === "lg" ? 18 : 16} aria-hidden /> : null}
      {children}
    </button>
  );
});

/**
 * IconButton — a square, icon-only button for compact toolbars (zoom, reorder,
 * fullscreen). Renders a visible label for screen readers via `aria-label`;
 * `label` also powers the native `title` tooltip.
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, variant = "ghost", size = "md", loading, active, className = "", disabled, ...rest },
  ref,
) {
  const iconSize = size === "lg" ? 20 : size === "sm" ? 15 : 17;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      data-loading={loading || undefined}
      data-active={active || undefined}
      disabled={disabled || loading}
      className={`btn ${VARIANT_CLASS[variant]} grid !place-items-center ${
        size === "sm" ? "!px-2 !py-2" : size === "lg" ? "!px-3 !py-3" : "!px-2.5 !py-2.5"
      } ${active ? "!border-accent !bg-accent/15 !text-accent" : ""} ${className}`}
      {...rest}
    >
      <Icon size={iconSize} aria-hidden />
    </button>
  );
});
