"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  PencilRuler,
  FolderOpen,
  LogIn,
  UserPlus,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  Gamepad2,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button, IconButton } from "@/components/ui/Button";
import { useSession } from "@/lib/useSession";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Matches nav active state by pathname prefix. */
  match?: (pathname: string) => boolean;
  auth?: boolean;
}

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home, match: (p) => p.startsWith("/dashboard") },
  { href: "/create", label: "Éditeur", icon: PencilRuler, match: (p) => p.startsWith("/create") },
];

const SECONDARY: NavItem[] = [
  { href: "/dashboard", label: "Mes profils", icon: FolderOpen, match: (p) => p.startsWith("/dashboard"), auth: true },
];

/**
 * AppSidebar — modern, collapsible app navigation for the in-app surfaces
 * (editor, dashboard). Distinct from the marketing SiteShell top header.
 *
 * - Compact rail on desktop (collapsible to icon-only), full labels otherwise.
 * - Active item highlighted via the pathname matcher.
 * - On mobile it collapses into a slide-in drawer triggered from a top bar.
 * - Auth-aware: shows login/register when logged out, email + logout when in.
 *
 * The sidebar surfaces the app's real sections only (Dashboard, Éditeur, Mes
 * profils) — the editor's internal wizard steps stay driven by the in-editor
 * step rail, since they're a single guided flow rather than independently
 * routable pages.
 */
export function AppSidebar() {
  const pathname = usePathname() ?? "/";
  const { user, loading, logout } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [...PRIMARY, ...SECONDARY.filter((n) => !n.auth || user)];

  const rail = (
    <nav
      className={`flex h-full flex-col gap-1 ${collapsed ? "items-center" : ""}`}
      aria-label="Navigation principale"
    >
      {items.map((item) => {
        const active = item.match?.(pathname) ?? pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              collapsed ? "justify-center" : ""
            } ${
              active
                ? "bg-accent/15 text-accent"
                : "text-content-secondary hover:bg-surface-2 hover:text-content-primary"
            }`}
          >
            <Icon size={18} aria-hidden className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const authBlock = loading ? (
    <div className="skeleton h-9 w-full" />
  ) : user ? (
    <div className="space-y-2">
      <div
        className={`truncate rounded-lg bg-surface-2 px-3 py-2 text-xs text-content-muted ${
          collapsed ? "text-center" : ""
        }`}
        title={user.email}
      >
        {collapsed ? <Gamepad2 size={16} className="mx-auto text-accent" /> : user.email}
      </div>
      <Button
        variant="ghost"
        size="sm"
        icon={LogOut}
        className={collapsed ? "!justify-center !px-2" : "w-full"}
        onClick={() => void logout().then(() => window.location.reload())}
        title={collapsed ? "Déconnexion" : undefined}
      >
        {collapsed ? "" : "Déconnexion"}
      </Button>
    </div>
  ) : (
    <div className={`space-y-2 ${collapsed ? "" : ""}`}>
      <Link href="/login" onClick={() => setMobileOpen(false)}>
        <Button
          variant="ghost"
          size="sm"
          icon={LogIn}
          className={collapsed ? "!justify-center !px-2 w-full" : "w-full"}
          title={collapsed ? "Connexion" : undefined}
        >
          {collapsed ? "" : "Connexion"}
        </Button>
      </Link>
      {!collapsed && (
        <Link href="/register" onClick={() => setMobileOpen(false)}>
          <Button size="sm" className="w-full" icon={UserPlus}>
            Créer un compte
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line-subtle bg-bg/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <IconButton
          icon={mobileOpen ? X : Menu}
          label="Menu"
          variant="ghost"
          onClick={() => setMobileOpen((v) => !v)}
        />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 surface-elevated animate-rise p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <IconButton icon={X} label="Fermer" variant="ghost" size="sm" onClick={() => setMobileOpen(false)} />
            </div>
            {rail}
            <div className="mt-6 border-t border-line-subtle pt-4">{authBlock}</div>
          </aside>
        </div>
      )}

      {/* Desktop rail */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line-subtle bg-base/60 p-4 transition-[width] lg:flex ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <Link href="/" aria-label="GameFolio — accueil" className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 font-black text-white">
              G
            </Link>
          ) : (
            <Logo />
          )}
          <IconButton
            icon={collapsed ? PanelLeft : PanelLeftClose}
            label={collapsed ? "Déployer la sidebar" : "Réduire la sidebar"}
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((v) => !v)}
          />
        </div>
        <div className="flex-1">{rail}</div>
        <div className="mt-4 border-t border-line-subtle pt-4">{authBlock}</div>
      </aside>
    </>
  );
}
