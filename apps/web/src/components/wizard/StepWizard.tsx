"use client";

import { useEffect } from "react";

/**
 * StepWizard — generic multi-step orchestrator driven by a simple array of
 * steps + current index (no per-step URL routing; everything stays in memory
 * for instant preview). Renders a progress bar and prev/next navigation.
 */
export interface StepWizardProps {
  steps: { id: string; label: string }[];
  current: number;
  onStepChange: (step: number) => void;
  onNext?: () => boolean | void;
  children: React.ReactNode;
}

export function StepWizard({
  steps,
  current,
  onStepChange,
  onNext,
  children,
}: StepWizardProps) {
  const progress = ((current + 1) / steps.length) * 100;

  // Keyboard nav: arrows + Enter for next.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" && current < steps.length - 1) onStepChange(current + 1);
      if (e.key === "ArrowLeft" && current > 0) onStepChange(current - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, steps.length, onStepChange]);

  function handleNext() {
    if (onNext?.() === false) return;
    if (current < steps.length - 1) onStepChange(current + 1);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-content-muted">
          <span>
            Étape {current + 1} / {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="mt-3 hidden gap-2 sm:grid sm:grid-cols-6">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onStepChange(i)}
                className={`w-full truncate rounded-md px-2 py-1 text-left text-xs transition ${
                  i === current
                    ? "bg-accent/15 text-accent"
                    : i < current
                      ? "text-content-secondary hover:text-content-primary"
                      : "text-content-muted"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex-1">{children}</div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => current > 0 && onStepChange(current - 1)}
          disabled={current === 0}
          className="btn btn-ghost px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={current === steps.length - 1}
          className="btn btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
