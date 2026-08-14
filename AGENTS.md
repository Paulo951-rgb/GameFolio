# Gamer CV — repository memory

Project: data-driven game-schema engine + constrained (anti-hallucination) text
generation for gamer CVs. Full architecture lives in the design doc (see chat).
This file captures the concrete decisions and build commands that survive across
sessions.

## What exists now (Phase 0 — Fondations)

Monorepo (pnpm workspaces), pure-TS domain packages only (no React/Next yet):

- `packages/types` — single source of truth for Zod schemas + types. Shared
  client/server so route handlers re-validate identically (never trust client).
- `packages/core` — pure domain logic, NO React/DOM/Next. Portable to a future
  Electron app as-is (only swap infrastructure: API routes→IPC, PG→SQLite).
  - `modules/` — `defineModule`, `defineGame`, `composeSchemas`, `mergeFields`,
    `resolveGame`, `resolveGameSchema`, `validateGameEntry`. Heart of the
    data-driven engine: a game = composition of generic modules, never custom UI.
  - `visibility/` — single chokepoint enforcing visible/hidden/private BEFORE any
    public page or AI prompt. `hidden` and `private` filter identically (only
    `visible` leaves storage); there is intentionally no public-vs-AI mode param.
  - `generation/` — anti-hallucination pipeline: `serializeProfile` drops empty
    values, `SYSTEM_PROMPT` forbids inventing facts, output validated against
    `GeneratedTextSchema`, `verifyFacts` flags numbers/proper nouns absent from
    input. Depends only on `AIProvider` interface, never a vendor SDK.
  - `templates/` — `TemplateRegistry` (presentation-only; data selection is owned
    by the visibility engine upstream).
- `packages/data` — game/module definitions (static, versioned, not in DB for MVP).
  - 5 generic modules: competitive, singleplayer, sandbox, progression, clan.
  - 4 test games: valorant, minecraft, hades, clash-of-clans (CoC composes
    progression+clan → exercises multi-module schema merge).
  - `buildGameRegistry` validates every game's modules resolve at load time.

## Build / dev commands

```bash
pnpm install          # corepack manages pnpm (11.x). COREPACK_ENABLE_DOWNLOAD_PROMPT=0 in CI.
pnpm -r test         # vitest — 71 tests (26 core + 11 data + 5 services + 6 types + 23 web), all green
pnpm -r typecheck    # tsc --noEmit across packages, all green
pnpm -r build        # tsc --noEmit (packages) + next build (apps/web)
# Run the export route live:
#   PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium AI_PROVIDER=mock \
#     PORT=12000 pnpm --filter @gamer-cv/web start
```

`pnpm-workspace.yaml` sets `verifyDepsBeforeRun: false` and `onlyBuiltDependencies:
[esbuild]` — the pre-run deps check otherwise re-triggers install and blocks
tests in this sandbox. If you add a package with a native build script, list it
under `onlyBuiltDependencies`.

## Key invariants (do not break)

- A module schema MUST be `z.object(...)` to be composable (`composeSchemas`
  throws otherwise). Overlapping field keys across composed modules are rejected
  (ambiguous) — caught at registry build, never at user runtime.
- `GameEntrySchema.moduleData` is `z.record(z.unknown())` globally; strict
  validation happens dynamically via `resolveGameSchema(gameId)`, never in a
  global schema that would have to know every game.
- AI generation input is ALWAYS visibility-filtered + empty-stripped before the
  provider sees it. A private/hidden field must never reach the AI prompt.
- `generatedText` is stored SEPARATELY from `moduleData`; regeneration never
  mutates source data.

## Next phases (per design doc)

- ~~Phase 1 — Wizard UI~~ DONE (see below).
- ~~Phase 2 — AI provider adapter (Anthropic first) behind `AIProvider`~~ DONE (see below).
- ~~Phase 3 — headless server render (Playwright) for pixel-perfect PDF/image~~ DONE (see below).
- ~~Phase 4 — Templates & personnalisation: 2-3 templates supplémentaires + thème personnalisable~~ DONE (see below).
- Phase 5+ — accounts/cloud, public sharing, scale catalogue.

## What exists now (Phase 4 — Templates & personnalisation)

- **Template registry** (`apps/web/src/components/preview/templates.tsx`) — the
  single source of truth mapping `templateId → {label, lazy component}`. Both
  `LivePreviewPane` and the isolated `/export` render page resolve through the
  shared `CVTemplate` resolver, so WYSIWYG export holds for EVERY template, not
  just the default (architecture §7, §8). Each template is its own chunk via
  `next/dynamic` (code-splitting, §2).
- **4 templates**: Minimaliste (default, dark), Gaming (bold neon accents,
  competitive/streamer), Classique (clean white serif, professional résumé),
  Néon (cyberpunk, glowing text on near-black). All presentation-only: they
  receive `NormalizedCVData + ThemeConfig` and render; swapping templates never
  changes which data is shown (the visibility engine owns that).
- **Shared presentation helpers** (`template-utils.ts`): `spacing(theme)` drives
  page/section/gap/text from `density`; `resolveColors`/`resolveFont` apply
  theme overrides with per-template defaults; `formatLabel`/`formatValue`
  humanize module fields. All templates use these for consistency.
- **Theme customization** (`CustomizeStep`) — template list now read from the
  registry (single source). Controls: primary/accent/background/text colors,
  font family (Inter / Georgia serif / Mono / system), density
  (compact/normal/spacious). Density is now wired into spacing across all
  templates (was stored-but-unused in Phase 1).
- Tests: `template-utils.test.ts` (12 — spacing/colors/font/formatLabel/
  formatValue), `templates.test.ts` (5 — all four component modules export a
  callable component + id checklist). 71 total tests green; typecheck + build
  green. Live-verified headless export for gaming/classique/neon (PNG) and neon
  (PDF) — distinct per-template output sizes confirm the resolver honors
  `templateId`.

## What exists now (Phase 3 — Export headless PDF/PNG)

- `packages/services/src/export/` — `ExportService` interface +
  `PlaywrightExporter` (PDF via `page.pdf`, PNG via `page.screenshot`). The
  exporter is behind the interface so a future Browserless/cloud-render adapter
  only needs to implement it. `createExportService()` factory, cached.
- **WYSIWYG**: the export renders the SAME `MinimalistTemplate` component the
  live preview uses, into an isolated `/export` render page (no app chrome,
  A4-sized). Headless Chromium navigates there and captures. No html2canvas/jsPDF
  (those degrade fonts/shadows — see architecture §8).
- Stateless render: the profile travels base64url-encoded in the `?data=` query
  param (encode server-side via `app/export/encode.ts` with `Buffer`; decode
  client-side via `app/export/decode.ts` with `atob` — split files to keep
  `Buffer` out of the client bundle). The render page sets `data-cv-rendered`
  once mounted, which the exporter waits for before capturing.
- API route `POST /api/export` — validates body with `ExportBodySchema`
  (profile + `format: "pdf"|"png"`), rate-limited per IP (capacity 3, stricter
  than AI since spawning a browser is expensive), returns the binary with
  `Content-Type`/`Content-Disposition`. Render URL derived from request host
  (`x-forwarded-proto`/`x-forwarded-host`), overridable via `EXPORT_BASE_URL`.
- `ExportMenu` (`apps/web/src/components/export/`) — PDF/PNG buttons with
  per-button loading + inline errors, downloads the blob. Wired into
  `PreviewStep` (preview → AI → export flow).
- Playwright is an **optional** dependency of both `packages/services` and
  `apps/web`; the dynamic import uses a computed specifier + `webpackIgnore`
  so webpack doesn't try to bundle it (its optional native deps like `kerberos`
  can't be statically resolved). It's also in
  `experimental.serverComponentsExternalPackages`. The `export/` module is
  deliberately NOT re-exported from the services top-level barrel so the AI
  routes don't pull playwright into their bundles; the export route imports from
  `@gamer-cv/services/export`.
- Browser binary: set `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` (system
  Debian chromium, `--no-sandbox` required in containers). Without it,
  Playwright's bundled browser is used (must run `npx playwright install`).
- Tests: `packages/services/test/export.test.ts` — real integration (spins a
  local HTTP page, renders PDF + PNG, asserts `%PDF-` / PNG signature). Only
  runs when `/usr/bin/chromium` exists (`describe.runIf`).

## What exists now (Phase 2 — Génération IA)

- `packages/services/src/ai/` — provider-agnostic `AIProvider` interface +
  adapters: `AnthropicProvider` (real, `@anthropic-ai/sdk`), `MockProvider`
  (deterministic, offline — uses lowercase formulations so `verifyFacts` does
  not false-positive on common French capitalized words). `createAIProvider()`
  factory picks by `AI_PROVIDER` env (`mock` default → never calls an external
  API in tests/dev; `anthropic` requires `ANTHROPIC_API_KEY`).
- The anti-hallucination pipeline from `packages/core/generation` is wired end
  to end: input is visibility-filtered + empty-stripped, `SYSTEM_PROMPT` forbids
  inventing facts, output validated against `GeneratedTextSchema`, then
  `verifyFacts` extracts numbers/proper nouns from the generated text and flags
  any absent from the input. `flaggedFacts` flows to the client for review.
- API routes (thin HTTP layer, no business logic in the handlers):
  - `POST /api/generate` — full generation from a profile.
  - `POST /api/regenerate` — regen with a free-text instruction ("plus court",
    "ne parle pas de mon âge"); sends prior text + raw data + instruction,
    always re-applies the anti-invention constraints. Returns a fresh full
    `GeneratedText`, never a text patch.
  - Both re-validate the request body with the shared Zod schemas
    (`apiSchemas.ts`) — never trust client data. Shared generation logic lives
    in `apps/web/src/lib/generation.ts` so the two routes stay DRY.
- Rate limiting (`apps/web/src/lib/rateLimit.ts`): token-bucket per client IP
  (capacity 5, refill 1/s) on generate + regenerate. Returns 429 with
  `Retry-After`. Tested in `apps/web/src/lib/__tests__/rateLimit.test.ts`.
- Store extended (`store.ts`) with `generatedText`, `flaggedFacts`,
  `isGenerating`, `generationError`, and generation actions that call the API
  routes via fetch.
- `AIGeneratePanel` (`apps/web/src/components/ai/`) — triggers generation,
  shows loading, renders the structured result (summary / strengths / perGame)
  with the `flaggedFacts` review banner, and exposes the regenerate instruction
  input. Wired into `PreviewStep` (the natural home — preview + AI + export flow).
- `apps/web/src/lib/normalize.ts` — shared `normalizeProfile` used by both
  `LivePreviewPane` and the (future) export render, so preview === export.
- `next.config.mjs` lists `@gamer-cv/services` in `transpilePackages` (it ships
  TS source + the anthropic SDK, both must be transpiled by Next).

## What exists now (Phase 1 — Wizard sans IA)

`apps/web` (Next.js App Router) + the React layer, all driven by the Phase 0
domain packages — no per-game UI code anywhere.

- State: Zustand store (`apps/web/src/lib/store.ts`) holds the in-progress
  `GamerProfile`. Autosaves to IndexedDB (idb-keyval) on every change (debounced);
  `hydrate()` restores on load → local-first, no account needed.
- `apps/web/src/lib/games.ts` — client-side resolution helpers wrapping
  `@gamer-cv/data` + `@gamer-cv/core`: `getGame`, `getResolvedGame`,
  `resolveFieldOptions` (reads `game.gameData[<optionsSource minus "game.">]`),
  `PLAYER_TYPES` taxonomy.
- `DynamicGameForm` — maps `FieldDescriptor.type` → widget (select/multiselect/
  number/text/textarea), options resolved from the game at render time. Uses
  react-hook-form + zodResolver on the composite schema. **Multiselect is
  controlled** (not registered): toggles call `setValue` + push to the store
  directly, because RHF `watch` doesn't reliably cover `setValue`-only fields.
- Wizard: 6 steps (info → player types → game count → games → customize →
  preview) via generic `StepWizard` (no per-step URL routing; arrow-key nav).
  Two-column desktop (edit | live preview), tab toggle on mobile.
- `LivePreviewPane` builds `NormalizedCVData` through the visibility engine
  (`filterPersonalInfo`/`filterGameEntry`) then renders the active template —
  the SAME filtered view the export step will render headlessly (WYSIWYG).
- One template (`MinimalistTemplate`) ships to validate the template engine.
- `GET /api/games/search?q=` — thin server wrapper over the static registry.

## What exists now (Phase 5 — Accounts, cloud profiles, sharing)

Local-first remains the default; cloud is opt-in behind a session.

- **DB**: Prisma + SQLite (local dev). Schema in `prisma/schema.prisma`
  (`User`, `GamerProfile`, `ProfileGame`, `ProfileVersion`). Game-specific data
  lives in `moduleData JSONB`, validated at the app layer by the composite
  module schema — never per-game SQL columns. Use `pnpm db:push` (no migrations
  for MVP). `.npmrc` hoists `*prisma*` (pnpm + Prisma generator workaround).
  `apps/web/src/lib/db.ts` is the singleton Prisma client.
- **Auth** (`apps/web/src/lib/auth.ts`): scrypt password hashing + HMAC-signed
  stateless session tokens (`<userId>.<hmac>`, secret = `AUTH_SECRET` env, ≥16
  chars). Cookie `session` (httpOnly, SameSite=Lax). No NextAuth dependency.
  Routes: `/api/auth/{register,login,logout,me}`. `/login` & `/register` pages
  share `AuthForm`; `useSession` hook + `HomeNav` adapt UI to auth state.
- **Cloud profiles**: `/api/profiles` (list/create), `/api/profiles/[id]`
  (get/patch/delete). `apps/web/src/lib/profile-mapper.ts` maps
  `GamerProfile`↔Prisma rows (`profileToCreateData` includes userId,
  `profileToUpdateData` omits it — ownership is immutable post-create; uses
  `Prisma.JsonNull` for cleared JSON fields). Anon→401, foreign profile→403.
- **Sharing**: `/api/share/[id]` toggles `isPublic` + mints/revokes a `slug`
  (`apps/web/src/lib/slug.ts`, 10-char nanoid, retried on collision; revoking
  nulls the slug). `/cv/[slug]` is a server component that runs
  `normalizeProfile` (visibility engine) so `hidden`/`private` fields never reach
  the public page — e.g. age="hidden" is stripped server-side. QR code via the
  `qrcode` lib (server `PublicQRCode` + client `ShareModal`). OG/Twitter meta
  set dynamically (og:image PNG preview not yet wired — needs export render).
- **ShareModal** (`apps/web/src/components/share/ShareModal.tsx`): save-to-cloud
  → toggle public → copy link → QR. Maps `INVALID_PROFILE` (422) to a helpful
  "fill at least the gamerTag" message. `PreviewStep` gained Share + Save buttons
  (Save visible only when logged in).
- **Dashboard** (`/dashboard`): lists the user's cloud profiles, loads one into
  the editor via `store.loadCloudProfile`.
- Tests: 18 new (auth 9 incl. token sign/verify/tamper + password hash;
  profile-mapper 6; slug 3). Full web suite 41 green. Build: 20 routes.

## Conventions

- Source-only TS packages: `main`/`types` point at `src/*.ts` (consumed
  uncompiled via TS path resolutions). Switch to `tsc` emit when a JS-only
  consumer (e.g. Next config) needs it.
- **Do NOT use `.js` extensions in relative imports.** Next.js/webpack can't
  resolve `./foo.js` for TS-source-only packages; use `./foo`. (Phase 0 used
  `.js` extensions assuming a bundler with ESM resolution — removed in Phase 1.)
- Comments explain non-obvious invariants only; do not restate code.
