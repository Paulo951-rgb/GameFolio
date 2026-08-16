"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  PencilRuler,
  FolderOpen,
  Sparkles,
  Gamepad2,
  Trophy,
  Clock,
  Layers,
  Eye,
} from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useEditorStore } from "@/lib/store";
import { gameRegistry } from "@/lib/games";
import { allBadges, computeBadges } from "@gamer-cv/core";
import { profileCompletion } from "@/lib/profileSummary";
import type { GamerProfile, PersonalInfo } from "@gamer-cv/types";
import { AppShell } from "@/components/layout/AppShell";
import {
  Container,
  Button,
  Card,
  Badge,
  StatTile,
  Avatar,
  Skeleton,
  EmptyState,
  Alert,
} from "@/components/ui";

interface ProfileListItem {
  id: string;
  slug: string | null;
  isPublic: boolean;
  updatedAt: string;
  templateId: string;
  personalInfo: PersonalInfo;
  _count: { games: number };
}

export default function DashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const loadCloudProfile = useEditorStore((s) => s.loadCloudProfile);
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const res = await fetch("/api/profiles");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error("LIST_FAILED");
        const data = (await res.json()) as { profiles: ProfileListItem[] };
        setProfiles(data.profiles);
      } catch {
        setError("Impossible de charger vos profils.");
      } finally {
        setListLoading(false);
      }
    })();
  }, [user, router]);

  async function openProfile(id: string) {
    try {
      const res = await fetch(`/api/profiles/${id}`);
      if (!res.ok) throw new Error();
      const profile = (await res.json()) as GamerProfile;
      loadCloudProfile(profile);
      router.push("/create");
    } catch {
      setError("Impossible d'ouvrir ce profil.");
    }
  }

  async function duplicateProfile(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/profiles/${id}`);
      if (!res.ok) throw new Error();
      const profile = (await res.json()) as GamerProfile;
      // Strip the id + cloud identity so the POST creates a fresh row.
      const { ...copy } = profile;
      copy.id = crypto.randomUUID();
      const createRes = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      });
      if (!createRes.ok) throw new Error();
      // Refresh the list.
      const list = await fetch("/api/profiles");
      const data = (await list.json()) as { profiles: ProfileListItem[] };
      setProfiles(data.profiles);
    } catch {
      setError("Impossible de dupliquer ce profil.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProfile(id: string) {
    if (!confirm("Supprimer définitivement ce GameFolio ?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Impossible de supprimer ce profil.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <Container>
          <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-accent">
              <FolderOpen size={28} aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-content-primary">Mes GameFolios</h1>
              <p className="mx-auto mt-2 max-w-md text-content-secondary">
                Connecte-toi pour accéder à tes profils sauvegardés dans le cloud et les
                retrouver sur tous tes appareils.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/login">
                <Button icon={Eye}>Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost">Créer un compte</Button>
              </Link>
            </div>
          </main>
        </Container>
      </AppShell>
    );
  }

  // In-progress local profile summary (read-only, drives the hero stats).
  const local = useEditorStore.getState().profile;
  const earnedBadges = computeBadges(local, gameRegistry);
  const localGames = local.games.filter((g) => g.gameId).length;
  const completion = profileCompletion(local);

  return (
    <AppShell>
      <Container width="wide">
        <main className="py-8">
          {/* Hero greeting + quick actions */}
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                url={local.personalInfo.avatarUrl}
                gamerTag={local.personalInfo.gamerTag}
                size="xl"
                className="shadow-[0_8px_30px_-12px_var(--accent-glow)]"
              />
              <div>
                <p className="text-sm text-content-muted">
                  {greeting()}, {user.email.split("@")[0]} 👋
                </p>
                <h1 className="mt-0.5 text-2xl font-bold text-content-primary">
                  {local.personalInfo.gamerTag || "Mon GameFolio"}
                </h1>
                <p className="mt-1 text-sm text-content-secondary">
                  Brouillon local · {localGames} jeu(x) · {earnedBadges.length} badge(s)
                </p>
              </div>
            </div>
            <Link href="/create">
              <Button size="lg" icon={Plus}>
                Créer un GameFolio
              </Button>
            </Link>
          </header>

          {/* Completion + global stats */}
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_2fr]">
            <Card surface="elevated" className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-content-secondary">
                    Avancement du profil
                  </h2>
                  <span className="text-2xl font-black text-accent">{completion}%</span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/create">
                  <Button size="sm" variant="secondary" icon={PencilRuler}>
                    Reprendre l&apos;éditeur
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="sm" variant="ghost" icon={Sparkles}>
                    Générer le texte IA
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon={Gamepad2} label="Jeux" value={localGames} />
              <StatCard
                icon={Trophy}
                label="Badges"
                value={`${earnedBadges.length} / ${allBadges().length}`}
              />
              <StatCard
                icon={Layers}
                label="Achievements"
                value={local.achievements?.length ?? 0}
              />
              <StatCard
                icon={Clock}
                label="Types de joueur"
                value={local.playerTypes.length}
              />
            </div>
          </div>

          {/* Earned badges row */}
          {earnedBadges.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-content-secondary">
                Badges débloqués
              </h2>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map((b) => (
                  <Badge key={b.id} tone="accent" title={b.description}>
                    <span aria-hidden>{b.icon}</span>
                    {b.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Cloud profiles */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-primary">Profils sauvegardés</h2>
              <span className="text-xs text-content-muted">{profiles.length} dans le cloud</span>
            </div>

            {error && (
              <Alert tone="danger" title="Impossible de charger vos profils." recovery="Vérifie ta connexion et recharge la page." />
            )}

            {listLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-3 h-3 w-24" />
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                    <Skeleton className="mt-4 h-8 w-full" />
                  </Card>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="Aucun GameFolio pour l&apos;instant"
                description="Crée ton premier profil puis utilise « Sauvegarder dans le cloud » depuis l&apos;aperçu."
                action={
                  <Link href="/create">
                    <Button icon={Plus}>Créer mon premier profil</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((p) => {
                  const tag = p.personalInfo?.gamerTag || "Sans pseudo";
                  const updated = new Date(p.updatedAt);
                  return (
                    <Card key={p.id} hover className="flex flex-col p-5">
                      <div className="flex items-start gap-3">
                        <Avatar url={p.personalInfo?.avatarUrl} gamerTag={tag} size="md" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold text-content-primary">
                            {tag}
                          </h3>
                          <p className="mt-0.5 text-xs text-content-muted">
                            Modifié {relativeTime(updated)}
                          </p>
                        </div>
                        {p.isPublic ? (
                          <Badge tone="success">Public</Badge>
                        ) : (
                          <Badge>Privé</Badge>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <StatTile label="Jeux" value={p._count.games} />
                        <StatTile
                          label="Template"
                          value={<span className="text-sm capitalize">{p.templateId}</span>}
                        />
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        <Button size="sm" icon={PencilRuler} onClick={() => void openProfile(p.id)}>
                          Modifier
                        </Button>
                        {p.isPublic && p.slug && (
                          <Link href={`/cv/${p.slug}`}>
                            <Button size="sm" variant="ghost" icon={Eye}>
                              Voir
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={busyId === p.id}
                          onClick={() => void duplicateProfile(p.id)}
                          aria-label="Dupliquer"
                        >
                          Dupliquer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={busyId === p.id}
                          onClick={() => void deleteProfile(p.id)}
                          aria-label="Supprimer"
                          className="!text-danger hover:!bg-danger/10"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </Container>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <Card surface="2" className="p-4">
      <div className="flex items-center justify-between">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-content-muted">
          {label}
        </dt>
        <Icon size={15} className="text-content-muted" aria-hidden />
      </div>
      <dd className="mt-1.5 text-2xl font-bold text-content-primary">{value}</dd>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Container width="wide">
      <main className="py-8">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="!h-24 !w-24 !rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="mb-8 h-40 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      </main>
    </Container>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

/** Rough French relative time ("il y a 3 j", "il y a 2 h"). Good enough for a card. */
function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return date.toLocaleDateString("fr-FR");
}
