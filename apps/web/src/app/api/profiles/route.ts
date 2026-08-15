import { NextResponse } from "next/server";
import { GamerProfileSchema } from "@gamer-cv/types";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { gamesToNestedCreate, profileToCreateData } from "@/lib/profile-mapper";

/**
 * List the logged-in user's profiles (for the dashboard). Lightweight: no
 * nested games unless requested via ?with=games. Requires auth.
 */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const rows = await prisma.gamerProfile.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      isPublic: true,
      updatedAt: true,
      createdAt: true,
      templateId: true,
      personalInfo: true,
      _count: { select: { games: true } },
    },
  });
  return NextResponse.json({ profiles: rows });
}

/**
 * Create a profile. Linked to the logged-in user when present (cloud save);
 * userId null for anonymous. The client sends the full GamerProfile; the server
 * re-validates with the shared Zod schema (architecture §3 — never trust
 * client data blindly). moduleData is stored as Json, validated dynamically
 * against the resolved game schema on save (left to the domain layer; the
 * global schema treats it as a record to stay game-agnostic).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = GamerProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PROFILE", issues: parsed.error.issues }, { status: 422 });
  }
  const userId = await getCurrentUserId();
  const p = parsed.data;
  const profile = await prisma.gamerProfile.create({
    data: {
      ...profileToCreateData({
        userId,
        personalInfo: p.personalInfo,
        playerTypes: p.playerTypes,
        achievements: p.achievements,
        templateId: p.templateId,
        themeConfig: p.themeConfig,
        generatedText: p.generatedText,
        games: p.games,
      }),
      games: { create: gamesToNestedCreate(p.games) },
    },
    include: { games: true },
  });
  return NextResponse.json({ id: profile.id }, { status: 201 });
}
