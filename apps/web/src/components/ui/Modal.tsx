"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

/**
 * Modal — accessible, centered dialog with a frosted backdrop.
 *
 * - Escape closes; backdrop click closes; focus is trapped inside the panel
 *   while open and returned to the trigger on close.
 * - Quick fade/scale-in animation (respects prefers-reduced-motion globally).
 * - Body scroll locked while open.
 * - `title` + optional `icon` render a consistent header; the close button is
 *   always present and keyboard-reachable.
 */
export function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && panel) {
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialogue"}
        className={`surface-elevated w-full ${width} animate-pop p-6 outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || Icon) && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-content-primary">
              {Icon ? <Icon size={20} className="text-accent" aria-hidden /> : null}
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="grid h-8 w-8 place-items-center rounded-md text-content-muted transition hover:bg-surface-2 hover:text-content-primary"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        )}
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
