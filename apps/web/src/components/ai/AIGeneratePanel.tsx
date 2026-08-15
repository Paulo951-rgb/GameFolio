"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store";
import { getGame } from "@/lib/games";
import type {
  GenerationMode,
  GenerationPersonality,
  GeneratedText,
} from "@gamer-cv/types";

interface AIStatus {
  providerId: string;
  real: boolean;
  configured: boolean;
  detail: string;
}

const MODES: { id: GenerationMode; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "rapid", label: "Rapide" },
  { id: "detailed", label: "Détaillé" },
  { id: "competitive", label: "Compétitif" },
  { id: "portfolio", label: "Portfolio" },
];

const PERSONALITIES: { id: GenerationPersonality; label: string }[] = [
  { id: "professionnel", label: "Professionnel" },
  { id: "gaming", label: "Gaming" },
  { id: "competitif", label: "Compétitif" },
  { id: "sobre", label: "Sobre" },
  { id: "dynamique", label: "Dynamique" },
  { id: "detaille", label: "Très détaillé" },
  { id: "court", label: "Court" },
  { id: "naturel", label: "Naturel" },
];

/**
 * AIGeneratePanel — triggers AI generation (and guided regeneration) of the CV
 * text, then displays the structured result. Hits server routes that run the
 * anti-hallucination pipeline; the server re-filters visibility + context-
 * enriches the profile before the provider sees the data.
 *
 * Initial generation → /api/generate ; guided regen → /api/regenerate.
 * Shows the active provider honestly (real model vs offline mock, §30).
 */
export function AIGeneratePanel() {
  const profile = useEditorStore((s) => s.profile);
  const flaggedFacts = useEditorStore((s) => s.flaggedFacts);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationError = useEditorStore((s) => s.generationError);
  const setGeneratedText = useEditorStore((s) => s.setGeneratedText);
  const setFlaggedFacts = useEditorStore((s) => s.setFlaggedFacts);
  const setGenerating = useEditorStore((s) => s.setGenerating);
  const setGenerationError = useEditorStore((s) => s.setGenerationError);

  const [instruction, setInstruction] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [mode, setMode] = useState<GenerationMode>("standard");
  const [personality, setPersonality] = useState<GenerationPersonality>("professionnel");
  const [status, setStatus] = useState<AIStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((s: AIStatus) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) setStatus({ providerId: "unknown", real: false, configured: false, detail: "Statut IA indisponible." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const generated = profile.generatedText;

  async function generate() {
    setGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, mode, personality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la génération.");
      setGeneratedText(data.text);
      setFlaggedFacts(data.flaggedFacts ?? []);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setGenerating(false);
    }
  }

  async function regenerate(instr: string) {
    setGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, instruction: instr, mode, personality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la régénération.");
      setGeneratedText(data.text);
      setFlaggedFacts(data.flaggedFacts ?? []);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setGenerating(false);
    }
  }

  const hasGames = profile.games.some((g) => g.gameId !== "");

  return (
    <div className="space-y-4 rounded-lg border border-line bg-surface p-4">
      <div>
        <h2 className="text-lg font-semibold text-content-primary">Génération IA</h2>
        <p className="mt-1 text-sm text-content-muted">
          L&apos;IA analyse ton profil, comprend tes expériences et rédige un
          vrai CV gamer. Le moteur n&apos;invente rien : seuls les champs
          renseignés sont utilisés.
        </p>
      </div>

      {status && (
        <p
          className={`rounded-md border p-2.5 text-xs ${
            status.real
              ? "border-success/40 bg-success/10 text-success"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          {status.real ? "✓ IA réelle active" : "ℹ Mode hors-ligne"} — {status.detail}
        </p>
      )}

      {!hasGames && (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          Ajoute au moins un jeu pour générer un texte pertinent.
        </p>
      )}

      {generationError && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {generationError}
        </p>
      )}

      {flaggedFacts.length > 0 && (
        <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          ⚠️ À vérifier : {flaggedFacts.join(", ")} (ces éléments n&apos;apparaissent
          pas dans tes données saisies).
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-content-muted">Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as GenerationMode)}
            className="field"
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-content-muted">Tonalité</span>
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value as GenerationPersonality)}
            className="field"
          >
            {PERSONALITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        disabled={!hasGames || isGenerating}
        onClick={generate}
        className="btn btn-primary w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating
          ? "Génération…"
          : generated
            ? "Régénérer mon Gamer CV"
            : "Générer mon Gamer CV"}
      </button>

      {generated && (
        <GeneratedSections
          generated={generated}
          advanced={advanced}
          setAdvanced={setAdvanced}
          setGeneratedText={setGeneratedText}
          instruction={instruction}
          setInstruction={setInstruction}
          isGenerating={isGenerating}
          regenerate={regenerate}
        />
      )}
    </div>
  );
}

interface GeneratedSectionsProps {
  generated: GeneratedText;
  advanced: boolean;
  setAdvanced: (v: boolean | ((p: boolean) => boolean)) => void;
  setGeneratedText: (text: GeneratedText) => void;
  instruction: string;
  setInstruction: (v: string) => void;
  isGenerating: boolean;
  regenerate: (instr: string) => void;
}

function GeneratedSections({
  generated,
  advanced,
  setAdvanced,
  setGeneratedText,
  instruction,
  setInstruction,
  isGenerating,
  regenerate,
}: GeneratedSectionsProps) {
  const editText = (key: keyof GeneratedText, value: string) =>
    setGeneratedText({ ...generated, [key]: value });

  return (
    <div className="space-y-3 border-t border-line pt-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-content-muted">
          {advanced
            ? "Mode avancé : édition directe du texte généré."
            : "CV généré par l'IA."}
        </span>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="rounded border border-line px-2 py-1 text-xs text-content-secondary transition hover:bg-surface"
        >
          {advanced ? "Quitter le mode avancé" : "Mode avancé"}
        </button>
      </div>

      <Section
        title="Présentation"
        value={generated.profileSummary ?? generated.summary ?? ""}
        advanced={advanced}
        onChange={(v) =>
          editText(generated.profileSummary ? "profileSummary" : "summary", v)
        }
      />

      {generated.gamingIdentity && (
        <Section
          title="Profil gaming"
          value={generated.gamingIdentity}
          advanced={advanced}
          onChange={(v) => editText("gamingIdentity", v)}
        />
      )}

      {generated.strengths.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
            Points forts
          </h3>
          {advanced ? (
            <textarea
              value={generated.strengths.join("\n")}
              onChange={(e) =>
                setGeneratedText({
                  ...generated,
                  strengths: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                })
              }
              rows={Math.max(2, generated.strengths.length)}
              className="field"
            />
          ) : (
            <ul className="mt-1 list-inside list-disc text-sm text-content-primary">
              {generated.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {generated.experience && (
        <Section
          title="Expérience"
          value={generated.experience}
          advanced={advanced}
          onChange={(v) => editText("experience", v)}
        />
      )}

      {generated.specializations.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
            Spécialisations
          </h3>
          <ul className="mt-1 list-inside list-disc text-sm text-content-primary">
            {generated.specializations.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {generated.performance && (
        <Section
          title="Performances"
          value={generated.performance}
          advanced={advanced}
          onChange={(v) => editText("performance", v)}
        />
      )}

      {generated.games.length > 0 ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
            Jeux
          </h3>
          <dl className="mt-1 space-y-2">
            {generated.games.map((g) => (
              <div key={g.gameId}>
                <dt className="text-sm font-medium text-accent">
                  {g.title ?? getGame(g.gameId)?.name ?? g.gameId}
                </dt>
                <dd className="text-sm text-content-primary">{g.description}</dd>
                {g.highlights.length > 0 && (
                  <ul className="mt-1 list-inside list-disc pl-2 text-xs text-content-muted">
                    {g.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </dl>
        </section>
      ) : Object.keys(generated.perGame).length > 0 ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
            Par jeu
          </h3>
          <dl className="mt-1 space-y-2">
            {Object.entries(generated.perGame).map(([gameId, text]) => (
              <div key={gameId}>
                <dt className="text-sm font-medium text-accent">
                  {getGame(gameId)?.name ?? gameId}
                </dt>
                {advanced ? (
                  <textarea
                    value={text}
                    onChange={(e) =>
                      setGeneratedText({
                        ...generated,
                        perGame: { ...generated.perGame, [gameId]: e.target.value },
                      })
                    }
                    rows={3}
                    className="field"
                  />
                ) : (
                  <dd className="text-sm text-content-primary">{text}</dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <div className="border-t border-line pt-3">
        <label className="block">
          <span className="block text-xs font-medium text-content-muted">
            Instruction de régénération
          </span>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="plus court, plus pro, mets Minecraft en avant…"
            className="field"
          />
        </label>
        <button
          type="button"
          disabled={!instruction.trim() || isGenerating}
          onClick={() => regenerate(instruction.trim())}
          className="btn btn-ghost w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Régénérer avec l&apos;instruction
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  value,
  advanced,
  onChange,
}: {
  title: string;
  value: string;
  advanced: boolean;
  onChange: (v: string) => void;
}) {
  if (!value) return null;
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
        {title}
      </h3>
      {advanced ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="field"
        />
      ) : (
        <p className="mt-1 text-sm text-content-primary">{value}</p>
      )}
    </section>
  );
}
