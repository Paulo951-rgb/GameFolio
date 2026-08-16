import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";

const ShareSchema = z.object({
  // make public + issue a fresh slug. Setting public:false revokes sharing
  // (clears slug) — architecture §9: regenerable, revocable without deleting.
  public: z.boolean(),
});

/**
 * GET the current share state (isPublic + slug) for a profile. Owner-only.
 * Used by the ShareModal so it reflects the ACTUAL stored state on open —
 * without this, an already-public profile would show its toggle unchecked,
 * and re-checking it would mint a NEW slug (invalidating the previously-shared
 * link). Non-owners get 403; a missing profile 404.
 */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const profile = await prisma.gamerProfile.findUnique({
    where: { id: ctx.params.id },
    select: { isPublic: true, slug: true, userId: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (profile.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return NextResponse.json({ isPublic: profile.isPublic, slug: profile.slug });
}

/**
 * Toggle a profile's public sharing. Owner-only. Enabling generates a new slug
 * (invalidating any previous link). Disabling clears the slug entirely so the
 * old /cv/[slug] URL stops resolving immediately.
 */
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const profile = await prisma.gamerProfile.findUnique({ where: { id: ctx.params.id } });
  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (profile.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = ShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  if (parsed.data.public) {
    // New slug each enable → old link is invalidated (§9 "régénérable").
    const slug = await generateUniqueSlug();
    await prisma.gamerProfile.update({
      where: { id: ctx.params.id },
      data: { isPublic: true, slug },
    });
    return NextResponse.json({ isPublic: true, slug });
  } else {
    await prisma.gamerProfile.update({
      where: { id: ctx.params.id },
      data: { isPublic: false, slug: null },
    });
    return NextResponse.json({ isPublic: false, slug: null });
  }
}
