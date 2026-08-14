import { NextResponse } from "next/server";
import { RegenerateBodySchema } from "@/lib/apiSchemas";
import { generateFromProfile } from "@/lib/generation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/regenerate — guided regeneration with a free instruction
 * ("plus court", "plus professionnel", ...). Same anti-hallucination pipeline;
 * the instruction is length-bounded upstream (apiSchemas).
 */
export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`regenerate:${ip}`, { capacity: 5, refillRate: 0.1 });
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

  const parsed = RegenerateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Requête invalide.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const result = await generateFromProfile(
      parsed.data.profile,
      parsed.data.instruction,
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de génération.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
