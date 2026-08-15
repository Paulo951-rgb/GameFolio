import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";

const COLS = [
  {
    title: "Produit",
    links: [
      { href: "/create", label: "Créer mon profil" },
      { href: "/dashboard", label: "Mes profils" },
      { href: "/create#templates", label: "Templates" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/login", label: "Connexion" },
      { href: "/register", label: "Créer un compte" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line-subtle">
      <Container width="wide">
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <Logo href="/" />
            <p className="mt-3 max-w-sm text-sm text-content-secondary">
              La plateforme qui transforme ton parcours de joueur en un portfolio
              gaming complet. Local-first, exportable, partageable.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-content-secondary transition hover:text-content-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line-subtle py-6 text-xs text-content-muted sm:flex-row">
          <p>© {new Date().getFullYear()} GameFolio. Construit pour les joueurs.</p>
          <p>Données 100 % issues de ton profil — aucune statistique inventée.</p>
        </div>
      </Container>
    </footer>
  );
}
