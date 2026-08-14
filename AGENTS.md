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
pnpm -r test         # vitest — 139 tests (45 core + 18 data + 5 services + 6 types + 65 web), all green
pnpm -r typecheck    # tsc --noEmit across packages, all green
pnpm -r build        # tsc --noEmit (packages) + next build (apps/web)
# Run the export route live:
#   PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium AI_PROVIDER=mock \
#     PORT=12000 pnpm --filter @gamer-cv/web start
```

`pnpm-workspace.yaml` sets `verifyDepsBeforeRun: false` and `allowBuilds`
(a package→boolean map, the pnpm 11 replacement for the removed
`onlyBuiltDependencies`/`neverBuiltDependencies` settings). It approves
`esbuild`, `prisma`, `@prisma/client`, `@prisma/engines` — without it pnpm 11
silently skips their build scripts (`ERR_PNPM_IGNORED_BUILDS`), so esbuild's
binary isn't installed and `@prisma/client`'s postinstall `prisma generate`
doesn't run. If you add a package with a native build script, add it under
`allowBuilds` (value `true`).

**Cross-platform scripts**: the `db:*` Prisma scripts (`prisma generate`,
`prisma db push`, `prisma migrate dev`, `prisma db seed`) are plain commands
with NO `VAR=value` prefix — that Unix shell syntax breaks Windows
PowerShell/CMD ("'PRISMA_SKIP_POSTINSTALL_GENERATE' n'est pas reconnu"). The
former `PRISMA_SKIP_POSTINSTALL_GENERATE=true` prefix was a no-op anyway (that
flag only affects the `@prisma/client` postinstall hook at install time, not
the `prisma` CLI). Do not re-add env-var prefixes to scripts; use `cross-env`
if one is ever genuinely needed.

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

- ~~Phase 5+ — accounts/cloud, public sharing, scale catalogue.~~ DONE (see above).
- **V2 audit pass (security/resilience/UX)** — applied on top of Phase 5:
  - **SSRF fix**: `resolveRenderUrl(profile)` in `apps/web/src/app/api/export/route.ts`
    no longer takes the request; it derives the render base URL from the trusted
    `EXPORT_BASE_URL` env var (falling back to `NEXT_PUBLIC_BASE_URL`) instead of
    client-controlled `Host`/`x-forwarded-*` headers. Chromium therefore always
    navigates to the server's own render page, never to an attacker-supplied URL.
    Same hardening in `apps/web/src/app/api/og/[slug]/route.ts` (handler param is
    now `_req`).
  - **AI robustness**: `AnthropicProvider.maxTokens` raised 2048→4096 (avoids
    truncated JSON for detailed/competitive CVs); `isRetryable` exported from
    `apps/web/src/lib/generation.ts` — the generate/regenerate routes retry
    **once** on `GenerationFormatError` (truncation/prose/schema mismatch) but
    never on auth/rate-limit/network errors.
  - **Duplicate-cloud-profile fix**: `cloudProfileId` added to `EditorState`
    (`store.ts`, separate IndexedDB key `gamer-cv:cloud-profile-id`). `loadCloudProfile`
    sets it; `PreviewStep` + `ShareModal` PATCH the existing profile when set,
    POST otherwise, then store the returned id — no more duplicate rows on repeat saves.
  - **DELETE** added to `/api/profiles/[id]/route.ts` (owner-only; 403 foreign,
    404 missing).
  - `resolveFieldOptions` (`games.ts`) now falls back to free-text input when a
    select/multiselect has empty options (game data drift no longer blanks the form).
- **Template field-rendering fix (V2)** — the "Détail par jeu" raw-data table in
  ALL 4 templates used to dump every module field, showing untouched fields as a
  wall of "—" with raw camelCase labels ("Kd Ratio", "Headshot Percent"). Two new
  helpers in `template-utils.ts`:
  - `isEmptyValue(val)` — flags null/undefined/""/NaN/empty-array so templates
    `.filter(([,v]) => !isEmptyValue(v))` and render only what the player filled in.
  - `resolveFieldLabel(key, fields?)` — prefers the module's curated French
    `FieldDescriptor.label` (e.g. "Ratio K/D") over `formatLabel`'s camelCase split.
  Every template now resolves `getResolvedGame(gameId).fields` and passes it to
  `resolveFieldLabel`. CV detail is French + noise-free across Minimalist/Gaming/
  Classique/Néon (live-verified: Valorant shows only "Heures approximatives: 800").
  `formatLabel` kept for the fallback path + tests.
- **`generatedText` undefined-field crash fix (V2)** — `/create` crashed with
  `TypeError: Cannot read properties of undefined (reading 'length')` at
  `AIGeneratePanel.tsx:319` (`generated.specializations.length`). Root cause:
  `GeneratedTextSchema` declares `specializations`/`strengths`/`games` with
  `.default([])` and `perGame` with `.default({})`, but Zod only applies those
  defaults when data passes through `.parse()`. `generatedText` reached the UI
  WITHOUT parsing from three untrusted entry points: IndexedDB `hydrate`
  (stale/legacy persisted shape), `loadCloudProfile` (Prisma JSON column cast
  `as GeneratedText` with no validation), and inline editor spreads. Fix is at
  the data-model source, NOT a `?.length` patch:
  - New `normalizeGeneratedText(text)` in `apps/web/src/lib/normalize.ts` —
    runs `GeneratedTextSchema.safeParse`; on success returns parsed data
    (defaults applied); on partial/legacy/foreign shape rebuilds a safe object
    (arrays→`[]`, perGame→`{}`, salvages valid strings), returns `undefined`
    only when no recognizable CV content remains.
  - Wired into `normalizeProfile` (protects server render paths `/cv/[slug]` +
    `/export` too), `store.hydrate`, `store.loadCloudProfile`, and
    `store.setGeneratedText` (defense-in-depth). The component keeps bare
    `.length`/`.map` because the contract now holds at runtime.
  - Tests: `normalize.test.ts` (10) pin the exact crash shape + empty
    specializations + incomplete AI response + all array fields non-undefined.

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

## What exists now (V2 — Moteur intelligent + vraie IA)

V2 keeps the Phase 0–5 architecture intact (data-driven modules, visibility
engine, anti-hallucination pipeline, WYSIWYG export, accounts/sharing). It
deepens the two priorities from the V2 brief: a richer game DB + a real
analysis-driven AI generation.

- **Game DB** (`packages/data/src/games/`): 71 games (was 44). Each game ships
  `aliases` (search synonyms), `platforms`, `developer`, `releaseYear`,
  `genres`, plus existing `ranks`/`roles`/`characters`/`modes`. Aliases are
  the dedup-friendly way to expose a game under several names (lol→League of
  Legends, mc→Minecraft) — no duplicate game rows. Games added across FPS,
  battle-royale, sandbox/survival, MOBA, racing, RPG, Nintendo/PlayStation/Xbox,
  mobile, and legacy consoles.
- **Modules** (`packages/data/src/modules/`): 28 composable modules (was 8).
  New: `survival`, `building`, `redstone`, `modding`, `serverAdmin`,
  `contentCreator`, `completion`, `achievement`, `moba`, `mmo`, `guild`,
  `cardgame`, `strategy`, `sports`, `fighting`, `speedrun`, `creative`,
  `weaponbased`, `rolebased`, `characterbased`. A game composes several; no
  per-game UI code. Competitive games (Valorant, CS2, LoL, Apex, R6) get the
  full competitive+characterbased+weaponbased stack; Minecraft composes
  sandbox+survival+building+redstone+creative — no forced ranked fields.
- **Search** (`packages/data/src/search.ts`): `searchGames(q)` with
  exact→starts-with→includes→genre→platform→fuzzy (Levenshtein ≤2) over name
  + aliases. Server route `GET /api/search?q=` is the thin wrapper; never load
  the full catalogue client-side (§28).
- **AI generation V2** (`packages/core/src/generation/index.ts`):
  - `enrichForGeneration(profile)` attaches each game's `__context` (name,
    genres, modules, ranks/roles/characters/modes) and surfaces per-game
    `freeText` at top level — so the model interprets field values *per game*
    (Diamant ≠ Champion ≠ 100% completion) (§20, §11).
  - `buildSystemPrompt(mode, personality)` enforces: ANALYZE the profile,
    deduce trends, then write — never reformat. Modes: standard/rapide/
    détaillé/compétitif/portfolio. Personalities: professionnel/gaming/
    compétitif/sobre/dynamique/très détaillé/court/naturel (§18, §19).
  - `verifyFacts` now receives a `gameMetaBlob` built from
    `enrichForGeneration` (game names, ranks, agents, etc.) so legitimate
    proper nouns from the catalogue don't false-positive (§16).
- **GeneratedText V2** (`packages/types/src/theme.ts`): structured output
  `profileSummary / gamingIdentity / strengths[] / experience / games[]`
  (gameId/title/description/highlights). `.refine()` rejects empty or
  foreign-shaped JSON (§17). Raw user data stays separate; regeneration never
  mutates it (§21, §22).
- **Providers**: `MockProvider` (offline, deterministic, analysis-flavored
  output — uses lowercase so verifyFacts doesn't flag French capitalization)
  and `AnthropicProvider` (real, V2 prompt, 2048 tokens). `createAIProvider()`
  picks by `AI_PROVIDER`. **Provider status is surfaced honestly**:
  `GET /api/ai/status` → `{providerId, real, configured}`, and the UI shows an
  explicit "Mode hors-ligne — Mock" banner with the env to set. No fake AI in
  prod (§30).
- **UI**: `AIGeneratePanel` has Mode + Tonalité selectors, the provider-status
  banner, regenerate-with-instruction. A shared `GeneratedSections` component
  renders the V2 output identically in all 4 templates (WYSIWYG preserved).
- **NaN bug fix (§26)**: empty `<input type=number>` registered via RHF
  `valueAsNumber` produced `NaN`, which leaked into the store/IndexedDB/AI
  prompt and rendered as "NaN". Fixed at 3 layers: `formatValue` coerces NaN→"—"
  (presentation), core `isEmpty` treats NaN as empty (AI pipeline safety — NaN
  never reaches the model), `DynamicGameForm` watch strips NaN (source/store).

V2 tests: 114 green (types 6, core 45 incl. enrichForGeneration/systemPrompt/
verifyFacts/serializeProfile-NaN, data 16 incl. search fuzzy/aliases, services
5, web 42 incl. NaN formatValue). typecheck + build green.
