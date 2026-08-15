import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dbProfileToProfile } from "@/lib/profile-mapper";
import { encodeProfileParam } from "@/app/export/encode";
import { createExportService } from "@gamer-cv/services/export";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/og/[slug] — OpenGraph image for a public CV.
 *
 * Loads the public profile from the DB (same source as /cv/[slug]), encodes it
 * into the stateless export render URL, and captures a PNG via the SAME
 * headless exporter as the download export (architecture §8 + §9: og:image =
 * export PNG of the CV). Returns image/png, cached briefly. Non-public or
 * unknown slugs 404 (don't reveal existence), mirroring /cv/[slug].
 *
 * Rate-limited per IP: each request spawns a headless browser (expensive), so
 * an unguarded endpoint could be abused to DoS the server. The Cache-Control
 * header lets a CDN absorb repeated crawls, but without a CDN every hit renders
 * — the limiter caps that cost.
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`og:${ip}`, { capacity: 5, refillRate: 0.1 });
  if (!rl.ok) {
    return new NextResponse(null, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  const row = await prisma.gamerProfile.findUnique({
    where: { slug: params.slug },
    include: { games: true },
  });
  if (!row || !row.isPublic) {
    return new NextResponse(null, { status: 404 });
  }

  const profile = dbProfileToProfile(row);

  // Trusted base only (see /api/export): never derive from the client Host
  // header (SSRF — the headless browser would fetch an attacker URL and leak
  // the encoded profile in ?data=).
  const base =
    process.env.EXPORT_BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 12000}`;
  const renderUrl = `${base.replace(/\/$/, "")}/export?data=${encodeProfileParam(profile)}`;

  const exporter = createExportService();
  try {
    const result = await exporter.render({ renderUrl, format: "png" });
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'export OG.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
