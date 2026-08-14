import { NextResponse } from "next/server";
import { GenerateBodySchema } from "@/lib/apiSchemas";
import { generateFromProfile } from "@/lib/generation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/generate — run AI generation on a profile.
 *
 * Local-first MVP: the profile is sent in the body (no server-side profile
 * storage yet). The server re-validates and re-filters visibility before
 * the provider sees the data. Rate-limited per IP (expensive route).
 */
export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`generate:${ip}`, { capacity: 5, refillRate: 0.1 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessaie dans un instant." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = GenerateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Profil invalide.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const result = await generateFromProfile(
      parsed.data.profile,
      undefined,
      parsed.data.mode,
      parsed.data.personality,
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de génération.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
