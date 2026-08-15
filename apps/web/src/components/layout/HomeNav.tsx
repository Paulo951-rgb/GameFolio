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
        <Link href="/login" className="btn btn-ghost px-3 py-1.5">
          Connexion
        </Link>
        <Link href="/register" className="btn btn-primary px-3 py-1.5">
          Compte
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-3 text-sm">
      <span className="max-w-[14rem] truncate text-content-muted" title={user.email}>
        {user.email}
      </span>
      <Link href="/dashboard" className="btn btn-ghost px-3 py-1.5">
        Mes GameFolios
      </Link>
      <button
        onClick={() => void logout().then(() => window.location.reload())}
        className="btn btn-ghost px-3 py-1.5"
      >
        Déconnexion
      </button>
    </nav>
  );
}
