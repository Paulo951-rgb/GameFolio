/**
 * Database seed — creates a clearly-labelled DEMO account + a PUBLIC, shared
 * profile so the /cv/[slug] page, dashboard and OG preview have real content
 * to render out of the box (no fake "real player" data — the gamerTag is
 * "ExempleDemo" and the bio says so).
 *
 * Idempotent: upserts by email (user) and slug (profile), so re-running is
 * safe and updates the demo content in place rather than duplicating rows.
 *
 * Run from the repo root: `pnpm db:seed` (DATABASE_URL=file:./dev.db).
 */
import { PrismaClient } from "@prisma/client";
import { scrypt as scryptCb, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const SCRYPT_KEYLEN = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const prisma = new PrismaClient();

async function main() {
  const email = "demo@gamefolio.local";
  const password = "demo1234";

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  // A clearly-labelled demo profile, shared publicly under a fixed slug so the
  // landing "voir un exemple" link + OG card have stable content.
  const slug = "demo";
  const personalInfo = {
    gamerTag: "ExempleDemo",
    country: "FR",
    languages: ["Français", "English"],
    platforms: ["PC"],
    bio: "Profil de démonstration GameFolio — exemple non réel.",
    socials: { twitch: "exempledemo" },
    visibility: {},
  };
  const playerTypes = ["Compétitif", "FPS", "Multi-jeux"];

  const games = [
    {
      // Field keys MUST match the competitive module schema (highestRank, roles)
      // so the badges engine (which reads moduleData.highestRank) and the CV
      // field labels (resolved from the module's FieldDescriptor) are correct.
      gameId: "valorant",
      moduleData: { hours: 800, currentRank: "Diamant 2", highestRank: "Diamant 3", roles: ["Duelist"] },
      freeText: "Exemple — données non réelles.",
      order: 0,
    },
    {
      gameId: "minecraft",
      moduleData: { hours: 1200, gameModes: ["Survie"] },
      freeText: "Exemple — données non réelles.",
      order: 1,
    },
  ];

  const achievements = [
    { id: "demo-a1", title: "Diamant atteint", gameId: "valorant", date: "2024", description: "Exemple" },
    { id: "demo-a2", title: "1000 heures Minecraft", gameId: "minecraft", description: "Exemple" },
  ];

  const themeConfig = {
    templateId: "gaming",
    primaryColor: "#22d3ee",
    accentColor: "#22d3ee",
    backgroundColor: "#020617",
    textColor: "#e2e8f0",
    density: "normal",
  };

  // Find any existing profile owned by the demo user and reuse its id; else create.
  const existing = await prisma.gamerProfile.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  const profileId = existing?.id ?? undefined;

  await prisma.gamerProfile.upsert({
    where: { id: profileId ?? "__nonexistent__" },
    update: {
      userId: user.id,
      slug,
      isPublic: true,
      personalInfo,
      playerTypes,
      achievements,
      templateId: themeConfig.templateId,
      themeConfig,
      games: { deleteMany: {}, create: games },
    },
    create: {
      userId: user.id,
      slug,
      isPublic: true,
      personalInfo,
      playerTypes,
      achievements,
      templateId: themeConfig.templateId,
      themeConfig,
      games: { create: games },
    },
  });

  // eslint-disable-next-line no-console
  console.log("✓ Seed complete — demo user:", email, "(password:", password + ")");
  // eslint-disable-next-line no-console
  console.log("✓ Public demo profile: /cv/" + slug);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
