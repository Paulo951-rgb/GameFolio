"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { StepWizard } from "@/components/wizard/StepWizard";
import { LivePreviewPane } from "@/components/preview/LivePreviewPane";
import { PersonalInfoStep } from "@/components/forms/PersonalInfoStep";
import { PlayerTypeStep } from "@/components/forms/PlayerTypeStep";
import { GameCountStep } from "@/components/forms/GameCountStep";
import { GameEntryStep } from "@/components/forms/GameEntryStep";
import { CustomizeStep } from "@/components/forms/CustomizeStep";
import { PreviewStep } from "@/components/forms/PreviewStep";

const STEPS = [
  { id: "info", label: "Infos perso" },
  { id: "types", label: "Type de joueur" },
  { id: "count", label: "Nombre de jeux" },
  { id: "games", label: "Jeux" },
  { id: "customize", label: "Personnaliser" },
  { id: "preview", label: "Aperçu" },
];

export default function CreatePage() {
  const currentStep = useEditorStore((s) => s.currentStep);
  const setStep = useEditorStore((s) => s.setStep);
  const hydrate = useEditorStore((s) => s.hydrate);
  const hydrated = useEditorStore((s) => s.hydrated);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Restore in-progress profile from IndexedDB on first load (local-first).
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Chargement…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Créer mon Gamer CV</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vos modifications sont sauvegardées automatiquement.
        </p>
      </header>

      {/* Mobile tab toggle */}
      <div className="mb-4 flex rounded-lg border border-slate-700 lg:hidden">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              mobileTab === tab
                ? "bg-violet-600/30 text-violet-200"
                : "text-slate-400"
            }`}
          >
            {tab === "edit" ? "Éditer" : "Aperçu"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor column */}
        <div
          className={`${
            mobileTab === "edit" ? "block" : "hidden"
          } lg:block lg:min-h-[70vh]`}
        >
          <StepWizard steps={STEPS} current={currentStep} onStepChange={setStep}>
            {currentStep === 0 && <PersonalInfoStep />}
            {currentStep === 1 && <PlayerTypeStep />}
            {currentStep === 2 && <GameCountStep />}
            {currentStep === 3 && <GameEntryStep />}
            {currentStep === 4 && <CustomizeStep />}
            {currentStep === 5 && <PreviewStep />}
          </StepWizard>
        </div>

        {/* Preview column */}
        <div
          className={`${
            mobileTab === "preview" ? "block" : "hidden"
          } lg:block lg:min-h-[70vh]`}
        >
          <LivePreviewPane />
        </div>
      </div>
    </div>
  );
}
