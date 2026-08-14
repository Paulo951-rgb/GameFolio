import { NextResponse } from "next/server";
import { GamerProfileSchema } from "@gamer-cv/types";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { dbProfileToProfile, gamesToNestedCreate, profileToUpdateData } from "@/lib/profile-mapper";

/**
 * GET a profile by id. Owners see the full typed profile. Non-owners (and the
 * public) only get it when isPublic=true AND via a different surface — the
 * /cv/[slug] page, never by raw id. This route is owner-scoped.
 */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  const profile = await prisma.gamerProfile.findUnique({
    where: { id: ctx.params.id },
    include: { games: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (profile.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return NextResponse.json(dbProfileToProfile(profile));
}

/**
 * PATCH (autosave). Owner-only. Games are replaced wholesale (deleteMany +
 * recreate) so the stored array always reflects the latest client state —
 * simpler and more reliable than per-field patching for a form-driven editor.
 */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const existing = await prisma.gamerProfile.findUnique({ where: { id: ctx.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = GamerProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PROFILE", issues: parsed.error.issues }, { status: 422 });
  }
  const p = parsed.data;
  await prisma.$transaction([
    prisma.profileGame.deleteMany({ where: { profileId: ctx.params.id } }),
    prisma.gamerProfile.update({
      where: { id: ctx.params.id },
      data: {
        ...profileToUpdateData({
          personalInfo: p.personalInfo,
          playerTypes: p.playerTypes,
          templateId: p.templateId,
          themeConfig: p.themeConfig,
          generatedText: p.generatedText,
          games: p.games,
        }),
        games: { create: gamesToNestedCreate(p.games) },
      },
    }),
  ]);
  return NextResponse.json({ id: ctx.params.id });
}