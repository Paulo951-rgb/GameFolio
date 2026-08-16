import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

/**
 * AppShell — chrome for in-app surfaces (editor, dashboard). Renders the
 * collapsible sidebar rail on desktop + a mobile drawer; the main content sits
 * in a flex-1 pane. Distinct from SiteShell (marketing header/footer) and from
 * the editor's own full-bleed layout — the editor wraps its content inside
 * this shell so the sidebar is available while editing.
 *
 * Public profile + export render pages deliberately bypass this (they have
 * their own chrome).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
