"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const NAV = [
  { href: "/create", label: "Créer" },
  { href: "/dashboard", label: "Mes profils", auth: true },
];

/**
 * SiteHeader — global top navigation used across marketing + app pages.
 * Sticky, frosted-glass surface. Adapts to auth state (login/register vs
 * email + dashboard + logout). Mobile collapses to a menu button.
 */
export function SiteHeader() {
  const { user, loading, logout } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = NAV.filter((n) => !n.auth || user);

  return (
    <header className="sticky top-0 z-40 border-b border-line-subtle bg-base/70 backdrop-blur-xl">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  pathname?.startsWith(n.href)
                    ? "text-content-primary"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {loading ? (
              <span className="h-9 w-24 animate-pulse rounded-md bg-surface-2" />
            ) : user ? (
              <>
                <span
                  className="max-w-[12rem] truncate text-xs text-content-muted"
                  title={user.email}
                >
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void logout().then(() => window.location.reload())}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Créer un compte</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md border border-line text-content-secondary md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="space-y-1 border-t border-line-subtle py-3 md:hidden">
            {links.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-content-secondary hover:bg-surface-2 hover:text-content-primary"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => void logout().then(() => window.location.reload())}
                >
                  Déconnexion
                </Button>
              ) : (
                <>
                  <Link href="/login" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button size="sm" className="w-full">
                      Compte
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
