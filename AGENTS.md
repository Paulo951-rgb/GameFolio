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
pnpm -r test         # vitest — 37 tests (26 core + 11 data), all green
pnpm -r typecheck    # tsc --noEmit across packages, all green
pnpm -r build        # tsc --noEmit (packages are TS-source-only for now)
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
- Phase 2 — AI provider adapter (Anthropic first) behind `AIProvider`.
- Phase 3 — headless server render (Playwright) for pixel-perfect PDF/image.
- Phase 4+ — more templates, accounts/cloud, public sharing, scale catalogue.

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

## Conventions

- Source-only TS packages: `main`/`types` point at `src/*.ts` (consumed
  uncompiled via TS path resolutions). Switch to `tsc` emit when a JS-only
  consumer (e.g. Next config) needs it.
- **Do NOT use `.js` extensions in relative imports.** Next.js/webpack can't
  resolve `./foo.js` for TS-source-only packages; use `./foo`. (Phase 0 used
  `.js` extensions assuming a bundler with ESM resolution — removed in Phase 1.)
- Comments explain non-obvious invariants only; do not restate code.
