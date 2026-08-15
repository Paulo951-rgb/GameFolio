"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { StepWizard } from "@/components/wizard/StepWizard";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { PersonalInfoStep } from "@/components/forms/PersonalInfoStep";
import { PlayerTypeStep } from "@/components/forms/PlayerTypeStep";
import { GameEntryStep } from "@/components/forms/GameEntryStep";
import { AchievementsStep } from "@/components/forms/AchievementsStep";
import { CustomizeStep } from "@/components/forms/CustomizeStep";
import { PreviewStep } from "@/components/forms/PreviewStep";
import { BadgesPreview } from "@/components/wizard/BadgesPreview";
import { Logo } from "@/components/layout/Logo";

/**
 * Wizard steps. The game count step was removed: the GameEntryStep now lets the
 * user toggle games in/out directly via the card grid (adding/removing entries
 * live), so a separate "how many games" step is redundant. Achievements is a
 * new dedicated step (§12).
 */
const STEPS = [
  { id: "info", label: "Identité" },
  { id: "types", label: "Profil" },
  { id: "games", label: "Jeux" },
  { id: "achievements", label: "Achievements" },
  { id: "customize", label: "Design" },
  { id: "preview", label: "Aperçu" },
];

export default function CreatePage() {
  const currentStep = useEditorStore((s) => s.currentStep);
  const setStep = useEditorStore((s) => s.setStep);
  const hydrate = useEditorStore((s) => s.hydrate);
  const hydrated = useEditorStore((s) => s.hydrated);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState(1);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const previewWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-content-muted">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Editor top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden text-sm text-content-muted sm:inline">
              / Éditeur
            </span>
          </div>
          <SaveStatus />
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {/* Mobile tab toggle */}
        <div className="mb-4 flex rounded-lg border border-line lg:hidden">
          {(["edit", "preview"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                mobileTab === tab
                  ? "bg-accent/15 text-accent"
                  : "text-content-muted"
              }`}
            >
              {tab === "edit" ? "Éditer" : "Aperçu"}
            </button>
          ))}
        </div>

        {/* 3-pane editor (desktop): left nav, center preview, right properties */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.9fr)]">
          {/* Left: steps + form */}
          <div
            className={`${
              mobileTab === "edit" ? "block" : "hidden"
            } lg:block lg:min-h-[75vh]`}
          >
            <StepWizard steps={STEPS} current={currentStep} onStepChange={setStep}>
              {currentStep === 0 && <PersonalInfoStep />}
              {currentStep === 1 && <PlayerTypeStep />}
              {currentStep === 2 && <GameEntryStep />}
              {currentStep === 3 && <AchievementsStep />}
              {currentStep === 4 && <CustomizeStep />}
              {currentStep === 5 && <PreviewStep />}
            </StepWizard>
          </div>

          {/* Center: live preview with zoom controls */}
          <div
            className={`${
              mobileTab === "preview" ? "block" : "hidden"
            } lg:block`}
          >
            <div className="lg:sticky lg:top-20">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-content-muted">
                  Aperçu en direct
                </span>
                <div className="flex items-center gap-1">
                  {/* Device toggle: desktop (full width) / mobile (390px column) */}
                  <div className="mr-1 flex rounded-md border border-line p-0.5">
                    <ZoomButton
                      onClick={() => setDevice("desktop")}
                      active={device === "desktop"}
                      title="Aperçu bureau"
                    >
                      🖥
                    </ZoomButton>
                    <ZoomButton
                      onClick={() => setDevice("mobile")}
                      active={device === "mobile"}
                      title="Aperçu mobile (390px)"
                    >
                      📱
                    </ZoomButton>
                  </div>
                  <ZoomButton onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} title="Dézoomer">
                    −
                  </ZoomButton>
                  <span className="w-12 text-center text-xs text-content-muted">
                    {Math.round(zoom * 100)}%
                  </span>
                  <ZoomButton onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} title="Zoomer">
                    +
                  </ZoomButton>
                  <ZoomButton onClick={() => setZoom(1)} title="Réinitialiser le zoom">
                    reset
                  </ZoomButton>
                  <ZoomButton
                    onClick={() => {
                      const el = previewWrapRef.current;
                      if (!el) return;
                      if (document.fullscreenElement) void document.exitFullscreen();
                      else void el.requestFullscreen();
                    }}
                    title="Plein écran"
                  >
                    ⛶
                  </ZoomButton>
                </div>
              </div>
              <div
                ref={previewWrapRef}
                className="overflow-auto rounded-lg border border-line bg-surface-2 p-4 lg:h-[78vh]"
                style={{ transformOrigin: "top center" }}
              >
                <div
                  className="mx-auto transition-[max-width] duration-200"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    maxWidth: device === "mobile" ? 390 : undefined,
                  }}
                >
                  <LivePreviewPane />
                </div>
              </div>
            </div>
          </div>

          {/* Right: properties / badges / quick info */}
          <aside
            className={`${
              mobileTab === "edit" ? "hidden" : "block"
            } space-y-4 lg:block lg:sticky lg:top-20 lg:self-start`}
          >
            <BadgesPreview />
            <StepSummary currentStep={currentStep} total={STEPS.length} onJump={setStep} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function ZoomButton({
  onClick,
  children,
  active = false,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-md border px-2 py-1 text-xs transition ${
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-line text-content-secondary hover:border-line-strong hover:text-content-primary"
      }`}
    >
      {children}
    </button>
  );
}

/** Compact save status reflecting the actual IndexedDB autosave lifecycle:
 *  "Enregistrement…" while a debounced write is pending, "Sauvegardé il y a
 *  Xs" once it lands, "Sauvegardé" before any save this session (e.g. right
 *  after hydrate). The relative-time string ticks via a 5s interval. */
function SaveStatus() {
  const isSaving = useEditorStore((s) => s.isSaving);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const [, tick] = useState(0);

  useEffect(() => {
    if (isSaving) return;
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, [isSaving]);

  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-content-muted">
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
          aria-hidden
        />
        Enregistrement…
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-content-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
        Sauvegardé il y a {relativeTime(lastSavedAt)}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-content-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      Sauvegardé
    </span>
  );
}

function relativeTime(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "quelques secondes";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h`;
}

/** Vertical step rail for the right pane — quick jump between steps. */
function StepSummary({
  currentStep,
  total,
  onJump,
}: {
  currentStep: number;
  total: number;
  onJump: (step: number) => void;
}) {
  return (
    <div className="surface-2 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-content-muted">
        Étapes
      </h3>
      <ol className="space-y-1">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onJump(i)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                i === currentStep
                  ? "bg-accent/15 text-accent"
                  : i < currentStep
                    ? "text-content-secondary hover:bg-surface"
                    : "text-content-muted hover:text-content-secondary"
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${
                  i < currentStep
                    ? "border-success text-success"
                    : i === currentStep
                      ? "border-accent text-accent"
                      : "border-line text-content-muted"
                }`}
              >
                {i < currentStep ? "✓" : i + 1}
              </span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 border-t border-line pt-3 text-xs text-content-muted">
        {Math.round(((currentStep + 1) / total) * 100)}% terminé
      </div>
    </div>
  );
}
