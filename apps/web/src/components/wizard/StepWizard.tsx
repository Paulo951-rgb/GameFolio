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
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>
            Étape {current + 1} / {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="mt-3 hidden grid-cols-6 gap-2 sm:grid">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onStepChange(i)}
                className={`w-full truncate rounded-md px-2 py-1 text-left text-xs transition ${
                  i === current
                    ? "bg-violet-600/30 text-violet-200"
                    : i < current
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-600"
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
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={current === steps.length - 1}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
