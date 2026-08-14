"use client";

import Link from "next/link";
import { useSession } from "@/lib/useSession";

/**
 * Top-right session nav: shows login/register for guests, email + dashboard +
 * logout for signed-in users. Client-only because it reads the session cookie
 * via the /api/auth/me round-trip.
 */
export function HomeNav() {
  const { user, loading, logout } = useSession();

  if (loading) return null;

  if (!user) {
    return (
      <nav className="flex gap-2 text-sm">
        <Link href="/login" className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800">
          Connexion
        </Link>
        <Link href="/register" className="rounded-md bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-500">
          Compte
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-3 text-sm">
      <span className="max-w-[14rem] truncate text-slate-400" title={user.email}>{user.email}</span>
      <Link href="/dashboard" className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800">
        Mes CV
      </Link>
      <button
        onClick={() => void logout().then(() => window.location.reload())}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
      >
        Déconnexion
      </button>
    </nav>
  );
}
