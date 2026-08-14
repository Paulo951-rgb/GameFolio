"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";

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
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-6">
        <h1 className="text-xl font-bold">
          {isRegister ? "Créer un compte" : "Connexion"}
        </h1>
        <p className="text-sm text-slate-400">
          {isRegister
            ? "Pour sauvegarder vos CV dans le cloud et les partager."
            : "Reprenez vos CV sauvegardés."}
        </p>
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Mot de passe</span>
          <input
            type="password"
            required
            minLength={isRegister ? 8 : 1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {isRegister && (
            <span className="mt-1 block text-xs text-slate-500">8 caractères minimum.</span>
          )}
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {busy ? "…" : isRegister ? "Créer le compte" : "Se connecter"}
        </button>
        <p className="text-center text-sm text-slate-400">
          {isRegister ? "Déjà un compte ? " : "Pas de compte ? "}
          <Link href={isRegister ? "/login" : "/register"} className="text-violet-400 hover:underline">
            {isRegister ? "Se connecter" : "Créer un compte"}
          </Link>
        </p>
      </form>
    </main>
  );
}
