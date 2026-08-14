import QRCode from "qrcode";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { dbProfileToProfile } from "@/lib/profile-mapper";
import { normalizeProfile } from "@/lib/normalize";
import { CVTemplate } from "@/components/preview/templates";
import { PublicQRCode } from "./PublicQRCode";

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
    title: `${tag} — Gamer CV`,
    description: `Profil gaming de ${tag}.`,
    openGraph: {
      title: `${tag} — Gamer CV`,
      description: `Profil gaming de ${tag}.`,
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Gamer CV de ${tag}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag} — Gamer CV`,
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

  return (
    <main className="min-h-screen bg-slate-950 py-8">
      <div className="mx-auto max-w-[210mm] px-4">
        <CVTemplate data={data} theme={profile.themeConfig} />
        <div className="mt-6 flex flex-col items-center gap-2 text-slate-400">
          <PublicQRCode dataUrl={qrDataUrl} />
          <p className="text-xs">Scannez pour partager ce profil</p>
        </div>
      </div>
    </main>
  );
}
