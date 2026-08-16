// Ensures a .env file exists at the repo root before Prisma commands run.
// Prisma loads DATABASE_URL from .env automatically; after a fresh clone the
// file is absent (it is gitignored), so `prisma db push` / `migrate` fail with
// "Environment variable not found: DATABASE_URL". This copies .env.example →
// .env when missing, without ever overwriting an existing .env (so a user's
// real config / keys are preserved). Cross-platform (pure Node, no shell).
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");
const examplePath = join(root, ".env.example");

if (existsSync(envPath)) {
  process.exit(0);
}

if (!existsSync(examplePath)) {
  console.error(
    "[ensure-env] No .env and no .env.example found in " + root + ".",
  );
  console.error(
    "[ensure-env] Create a .env with at least DATABASE_URL=\"file:./dev.db\".",
  );
  process.exit(1);
}

copyFileSync(examplePath, envPath);
console.log("[ensure-env] Created .env from .env.example (was missing).");
console.log(
  "[ensure-env] Edit .env to set your AI provider / API key if needed.",
);
