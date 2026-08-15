import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * SiteShell — page-level chrome for marketing + app pages that share the
 * global header/footer (homepage, dashboard, auth, public profile).
 *
 * The editor (`/create`) and the isolated export render page (`/export`) opt
 * OUT of this shell: they render their own full-bleed chrome because they
 * need the full viewport for the 3-pane editor / headless capture.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
