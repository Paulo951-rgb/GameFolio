"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const map: Record<string, string> = {
          EMAIL_TAKEN: "Un compte existe déjà avec cet email.",
          INVALID_CREDENTIALS: "Email ou mot de passe invalide.",
          INVALID_INPUT: "Saisie invalide (email valide, mot de passe ≥ 8).",
        };
        setError(map[data.error ?? ""] ?? "Échec de l’opération.");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <form
          onSubmit={onSubmit}
          className="surface-elevated w-full max-w-sm animate-rise p-7"
        >
          <h1 className="text-xl font-bold text-content-primary">
            {isRegister ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            {isRegister
              ? "Pour sauvegarder tes profils dans le cloud et les partager."
              : "Reprends tes profils sauvegardés."}
          </p>

          <div className="mt-6 space-y-4">
            <Field label="Email" htmlFor="email" required>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                autoComplete="email"
              />
            </Field>
            <Field
              label="Mot de passe"
              htmlFor="password"
              required
              hint={isRegister ? "8 caractères minimum." : undefined}
            >
              <input
                id="password"
                type="password"
                required
                minLength={isRegister ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </Field>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={busy} className="mt-6 w-full" size="lg">
            {busy ? "…" : isRegister ? "Créer le compte" : "Se connecter"}
          </Button>

          <p className="mt-5 text-center text-sm text-content-secondary">
            {isRegister ? "Déjà un compte ? " : "Pas de compte ? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-medium text-accent hover:underline"
            >
              {isRegister ? "Se connecter" : "Créer un compte"}
            </Link>
          </p>
        </form>
      </div>
    </SiteShell>
  );
}
