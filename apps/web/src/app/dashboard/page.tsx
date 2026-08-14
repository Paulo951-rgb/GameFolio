"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import { useEditorStore } from "@/lib/store";
import type { GamerProfile } from "@gamer-cv/types";

interface ProfileListItem {
  id: string;
  slug: string | null;
  isPublic: boolean;
  updatedAt: string;
  templateId: string;
}

export default function DashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const loadCloudProfile = useEditorStore((s) => s.loadCloudProfile);
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError("Impossible d’ouvrir ce profil.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-500">Chargement…</main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-300">Connectez-vous pour accéder à vos CV sauvegardés.</p>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-md bg-violet-600 px-4 py-2 font-medium text-white">Se connecter</Link>
          <Link href="/register" className="rounded-md border border-slate-700 px-4 py-2 text-slate-300">Créer un compte</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes CV</h1>
        <Link href="/create" className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
          + Nouveau CV
        </Link>
      </header>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {listLoading ? (
        <p className="text-slate-500">Chargement…</p>
      ) : profiles.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-950 p-6 text-slate-400">
          Aucun CV sauvegardé. Créez-en un puis utilisez « Sauvegarder dans le cloud ».
        </p>
      ) : (
        <ul className="space-y-2">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <div>
                <p className="font-medium text-slate-200">CV · {p.templateId}</p>
                <p className="text-xs text-slate-500">
                  {new Date(p.updatedAt).toLocaleString()}
                  {p.isPublic && p.slug ? " · public" : " · privé"}
                </p>
              </div>
              <div className="flex gap-2">
                {p.isPublic && p.slug && (
                  <Link
                    href={`/cv/${p.slug}`}
                    className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Voir
                  </Link>
                )}
                <button
                  onClick={() => void openProfile(p.id)}
                  className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                >
                  Modifier
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
