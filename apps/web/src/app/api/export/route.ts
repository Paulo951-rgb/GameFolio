import { NextResponse } from "next/server";
import { ExportBodySchema } from "@/lib/apiSchemas";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createExportService } from "@gamer-cv/services/export";
import { encodeProfileParam } from "@/app/export/encode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/export — render the profile to PDF/PNG via headless Chromium.
 *
 * The profile is encoded into the isolated /export render URL (stateless, no
 * server-side profile storage). The exporter navigates there and captures the
 * SAME template component the user saw in the live preview → pixel-perfect
 * (architecture §8). Rate-limited per IP (expensive: spawns a browser).
 *
 * The base render URL is derived from the request host so it works behind any
 * proxy; override with EXPORT_BASE_URL for unusual setups.
 */
function resolveRenderUrl(profile: unknown, req: Request): string {
  const base = process.env.EXPORT_BASE_URL;
  if (base) {
    return `${base.replace(/\/$/, "")}/export?data=${encodeProfileParam(profile)}`;
  }
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost";
  return `${proto}://${host}/export?data=${encodeProfileParam(profile)}`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`export:${ip}`, { capacity: 3, refillRate: 0.05 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop d'exports. Réessaie dans un instant." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = ExportBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Requête invalide.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const renderUrl = resolveRenderUrl(parsed.data.profile, req);
  const exporter = createExportService();

  try {
    const result = await exporter.render({
      renderUrl,
      format: parsed.data.format,
    });
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'export.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
