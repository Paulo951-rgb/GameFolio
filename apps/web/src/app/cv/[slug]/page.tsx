import QRCode from "qrcode";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { dbProfileToProfile } from "@/lib/profile-mapper";
import { normalizeProfile } from "@/lib/normalize";
import { CVTemplate } from "@/components/preview/templates";
import { resolveTemplateBackground } from "@/components/preview/template-themes";
import { PublicQRCode } from "./PublicQRCode";
import { PublicProfileActions } from "./PublicProfileActions";
import { Logo } from "@/components/layout/Logo";

/**
 * Public CV page — server component (architecture §9). Defense-in-depth: even
 * though the owner filtered visibility on the client, the server RE-FILTERS
 * via normalizeProfile before rendering (architecture §3 + §19#7: a
 * hidden/private field must never reach /cv/[slug]). Only isPublic profiles
 * are exposed; non-public or unknown slugs 404 (don't reveal existence).
 */
export const dynamic = "force-dynamic";
export const revalidate = 60; // short cache to limit load

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await prisma.gamerProfile.findUnique({
    where: { slug: params.slug },
    select: { isPublic: true, personalInfo: true },
  });
  if (!profile || !profile.isPublic) return {};
  const tag = (profile.personalInfo as { gamerTag?: string }).gamerTag ?? "Gamer CV";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const ogImage = `${baseUrl}/api/og/${params.slug}`;
  return {
    title: `${tag} — GameFolio`,
    description: `Profil gaming de ${tag}. Jeux, statistiques, achievements et badges.`,
    openGraph: {
      title: `${tag} — GameFolio`,
      description: `Profil gaming de ${tag}. Jeux, statistiques, achievements et badges.`,
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `GameFolio de ${tag}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag} — GameFolio`,
      description: `Profil gaming de ${tag}.`,
      images: [ogImage],
    },
  };
}

export default async function PublicCVPage({ params }: { params: { slug: string } }) {
  const row = await prisma.gamerProfile.findUnique({
    where: { slug: params.slug },
    include: { games: true },
  });
  if (!row || !row.isPublic) {
    notFound();
  }
  const profile = dbProfileToProfile(row);
  const data = normalizeProfile(profile);
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/cv/${params.slug}`;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1, width: 160 });
  // Match the CV canvas to the template's background so the portfolio reads as
  // one coherent surface (a white Classique CV on the global dark bg would look
  // floaty; a dark Minimalist CV on white would show seams).
  const canvasBg = resolveTemplateBackground(profile.themeConfig);

  return (
    <div className="min-h-screen bg-bg">
      {/* Slim portfolio header — distinct from the editor chrome */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <PublicProfileActions slug={params.slug} profile={profile} />
        </div>
      </header>

      <main className="py-8" style={{ backgroundColor: canvasBg }}>
        <div className="mx-auto max-w-[210mm] px-4">
          <CVTemplate data={data} theme={profile.themeConfig} />
          <div className="mt-6 flex flex-col items-center gap-2 text-content-muted">
            <PublicQRCode dataUrl={qrDataUrl} />
            <p className="text-xs">Scanne pour partager ce profil</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-content-muted">
        <a href="/" className="hover:text-content-secondary">
          Crée ton propre GameFolio →
        </a>
      </footer>
    </div>
  );
}
