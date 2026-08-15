import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoPreviewCard } from "@/components/landing/DemoPreviewCard";
import { TemplateGallery } from "@/components/landing/TemplateGallery";

const STEPS = [
  {
    n: "01",
    title: "Choisis tes jeux",
    desc: "Plus de 70 jeux disponibles avec champs dédiés : Valorant, Minecraft, Rocket League, Fortnite…",
  },
  {
    n: "02",
    title: "Ajoute tes statistiques",
    desc: "Rangs, heures, K/D, rôles, personnages. Chaque jeu expose uniquement les champs qui le concernent.",
  },
  {
    n: "03",
    title: "Personnalise ton profil",
    desc: "Template, couleurs, typographie, densité. WYSIWYG : ce que tu vois est ce que tu exportes.",
  },
  {
    n: "04",
    title: "Partage ton GameFolio",
    desc: "Profil public, lien partageable, QR code, export PDF ou image haute résolution.",
  },
];

const FEATURES = [
  {
    icon: "🎮",
    title: "Jeux",
    desc: "Catalogue riche généré par modules composites. Aucune donnée codée en dur dans l’UI.",
  },
  {
    icon: "📊",
    title: "Statistiques",
    desc: "Agrégats honnêtes : seules les valeurs réellement renseignées sont comptabilisées.",
  },
  {
    icon: "🏆",
    title: "Achievements",
    desc: "Suis tes accomplissements par jeu, avec date et preuve. Rien n’est inventé.",
  },
  {
    icon: "🧬",
    title: "Badges",
    desc: "Badges calculés automatiquement à partir de tes données réelles — jamais attribués sans condition.",
  },
  {
    icon: "🎨",
    title: "Templates",
    desc: "Plusieurs designs visuellement distincts, tous compatibles avec les mêmes données.",
  },
  {
    icon: "📄",
    title: "Export",
    desc: "PDF et PNG rendus en headless via Chromium. Haute fidélité, polices et ombres préservées.",
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Container width="wide">
          <div className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="animate-rise">
              <span className="chip">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Portfolio gaming · local-first
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-content-primary sm:text-5xl lg:text-6xl">
                Ton identité gaming.
                <br />
                <span className="text-gradient">Ton histoire.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-content-secondary sm:text-lg">
                GameFolio transforme ton parcours de joueur en un portfolio gaming
                complet : jeux, statistiques, rangs, achievements, badges. Crée,
                personnalise, exporte en PDF et partage ton profil — sans inventer
                une seule donnée.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/create">
                  <Button size="lg">
                    Créer mon Gamer CV
                    <span aria-hidden>→</span>
                  </Button>
                </Link>
                <Link href="/cv/demo">
                  <Button variant="ghost" size="lg">
                    Voir un exemple
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-content-muted">
                <span>✓ Aucun compte requis</span>
                <span>✓ Sauvegarde automatique</span>
                <span>✓ Anti-hallucination IA</span>
              </div>
            </div>

            <div className="animate-pop lg:pl-8">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-accent/20 to-accent-2/10 blur-2xl"
                />
                <div className="relative">
                  <DemoPreviewCard />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-line-subtle py-16">
        <Container>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Comment ça marche
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              4 étapes, ton profil en ligne
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Card
                key={s.n}
                hover
                className="animate-rise p-6"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-sm font-black text-accent">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-content-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-content-secondary">{s.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section className="py-16">
        <Container>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Tout ton gaming au même endroit
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Une plateforme, pas un simple CV
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-content-secondary">
              GameFolio rassemble chaque facette de ton identité de joueur dans un
              profil cohérent, exportable et partageable.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} hover className="p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-2 text-xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-content-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-content-secondary">{f.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* TEMPLATES */}
      <section className="border-t border-line-subtle py-16">
        <Container>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Templates
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Choisis ton style
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-content-secondary">
              Plusieurs templates visuellement distincts. Changer de template ne
              modifie que l’enveloppe visuelle, jamais les données affichées.
            </p>
          </div>
          <div className="mt-10">
            <TemplateGallery />
          </div>
        </Container>
      </section>

      {/* AI */}
      <section className="py-16">
        <Container width="narrow">
          <Card surface="elevated" className="glow-accent overflow-hidden p-8 text-center sm:p-12">
            <span className="text-3xl">✨</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Une présentation générée par IA
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-content-secondary sm:text-base">
              GameFolio analyse ton profil et rédige une présentation professionnelle.
              L’IA utilise <strong className="text-content-primary">uniquement</strong> les
              données présentes — elle n’invente jamais un rang, des heures ou une
              statistique. Un système anti-hallucination vérifie chaque fait généré.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Mode rapide", "Détaillé", "Compétitif", "Portfolio"].map((m) => (
                <span key={m} className="chip">
                  {m}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/create">
                <Button size="lg">Essayer la génération IA</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>

      {/* PUBLIC PROFILE */}
      <section className="border-t border-line-subtle py-16">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Profil public
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Partage ton portfolio en un lien
              </h2>
              <p className="mt-4 text-sm text-content-secondary sm:text-base">
                Active le partage et obtiens une page profil publique, optimisée
                pour les réseaux. Open Graph prêt pour Discord, Twitter et
                messageries. QR code inclus.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-content-secondary">
                {[
                  "Page portfolio distincte de l’éditeur",
                  "Champs privés/hidden jamais exposés publiquement",
                  "Aperçu OG avec image dynamique",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-success" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Card surface="elevated" className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 font-black text-white">
                  G
                </div>
                <div>
                  <div className="font-semibold text-content-primary">gamefolio.app/cv/…</div>
                  <div className="text-xs text-content-muted">Lien partageable</div>
                </div>
              </div>
              <div className="mt-4 surface-2 rounded-lg p-4 text-xs text-content-secondary">
                <div className="font-mono text-content-primary">
                  https://gamefolio.app/cv/<span className="text-accent">x7k2m9</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="chip text-success">● Public</span>
                  <span className="chip">QR</span>
                  <span className="chip">OG image</span>
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] text-content-muted">
                Maquette illustrative
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container width="narrow">
          <div className="surface-elevated glow-accent p-10 text-center sm:p-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Prêt à construire ton identité gaming ?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-content-secondary">
              Aucun compte requis pour commencer. Tes données restent sur ton
              appareil jusqu’à ce que tu choisisses de les partager.
            </p>
            <div className="mt-8">
              <Link href="/create">
                <Button size="lg">
                  Créer mon GameFolio
                  <span aria-hidden>→</span>
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
