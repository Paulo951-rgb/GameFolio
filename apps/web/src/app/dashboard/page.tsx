"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { useEditorStore } from "@/lib/store";
import type { GamerProfile, PersonalInfo } from "@gamer-cv/types";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container, Button, Card, Badge, StatTile } from "@/components/ui";

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
      <SiteShell>
        <main className="flex min-h-[60vh] items-center justify-center text-content-muted">
          Chargement…
        </main>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <Container>
          <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-content-primary">Mes GameFolios</h1>
            <p className="max-w-md text-content-secondary">
              Connecte-toi pour accéder à tes profils sauvegardés dans le cloud et les retrouver
              sur tous tes appareils.
            </p>
            <div className="flex gap-2">
              <Link href="/login">
                <Button>Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost">Créer un compte</Button>
              </Link>
            </div>
          </main>
        </Container>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Container width="wide">
        <main className="py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-content-muted">Bonjour 👋</p>
              <h1 className="mt-1 text-2xl font-bold text-content-primary">Mes GameFolios</h1>
            </div>
            <Link href="/create">
              <Button size="lg">+ Créer un GameFolio</Button>
            </Link>
          </header>

          {error && (
            <p className="mb-4 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          )}

          {listLoading ? (
            <p className="text-content-muted">Chargement…</p>
          ) : profiles.length === 0 ? (
            <Card surface="2" className="p-10 text-center">
              <p className="text-content-secondary">Aucun GameFolio pour l'instant.</p>
              <p className="mt-1 text-sm text-content-muted">
                Crée ton premier profil puis utilise « Sauvegarder dans le cloud ».
              </p>
              <Link href="/create" className="mt-4 inline-block">
                <Button>Créer mon premier profil</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => {
                const tag = p.personalInfo?.gamerTag || "Sans pseudo";
                const updated = new Date(p.updatedAt);
                const relTime = relativeTime(updated);
                return (
                  <Card key={p.id} hover className="flex flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-content-primary">
                          {tag}
                        </h3>
                        <p className="mt-0.5 text-xs text-content-muted">
                          Modifié {relTime}
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
                      <StatTile label="Template" value={<span className="text-sm capitalize">{p.templateId}</span>} />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      <Button size="sm" onClick={() => void openProfile(p.id)}>
                        Modifier
                      </Button>
                      {p.isPublic && p.slug && (
                        <Link href={`/cv/${p.slug}`}>
                          <Button size="sm" variant="ghost">
                            Voir
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === p.id}
                        onClick={() => void duplicateProfile(p.id)}
                      >
                        Dupliquer
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === p.id}
                        onClick={() => void deleteProfile(p.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </Container>
    </SiteShell>
  );
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
