# GameFolio

> **Le portfolio gaming complet d'un joueur** — construis ton identité gaming (avatar, pseudo, bio, jeux, stats, rangs, achievements, badges, équipes, expériences), personnalise-la visuellement, puis exporte-la en PDF/image ou partage un profil public. Le CV n'est qu'un format d'export du profil.

GameFolio ne code jamais un jeu en dur dans un composant React. Chaque jeu est une **définition de données** (composition de modules + métadonnées) ; un formulaire dynamique, un aperçu live et des templates génériques interprètent ces schémas. Ajouter un jeu = un fichier, pas de code UI. Les **badges** sont calculés automatiquement à partir des données réelles (jamais attribués sans condition vérifiée) ; les **achievements** sont saisis par le joueur et liés à un jeu.

La génération de présentation par IA suit un vrai pipeline d'analyse : les données saisies sont d'abord **enrichies du contexte de chaque jeu** (métadonnées, rangs, rôles, personnages), puis l'IA **analyse le profil**, en déduit les points forts et tendances, et **rédige** un texte structuré — sans jamais inventer de fait absent des données sources (pipeline anti-hallucination : seules les valeurs saisies sont envoyées, la sortie JSON est validée par Zod, puis vérifiée post-génération).

> **V2** — plateforme gaming moderne : 72 jeux, 28 modules composables, 6 templates visuellement distincts, recherche tolérante aux fautes, génération IA par analyse (modes + tonalités), badges & achievements, profil public partageable avec og:image, statut fournisseur honnête, sécurité export (anti-SSRF), robustesse des données générées.

---

## Aperçu

- **Identité gaming** — avatar (aperçu live + validation URL), pseudo, bio, localisation, langues, plateformes, liens (Twitch, Discord…).
- **Jeux & statistiques** — cartes de jeux avec recherche/filtres instantanés, champs pertinents par jeu (Valorant : K/D, winrate, headshot %, rang/peak, agents… ; Minecraft : mode, serveurs, redstone, PvP…).
- **Badges auto** — calculés uniquement à partir des données présentes (1000+ Heures, Compétitif, FPS Main, Multigame, Builder, Tournament Player…). Architecture extensible (`id`, `nom`, `description`, `icône`, `condition`, `catégorie`).
- **Achievements** — saisis manuellement, liés à un jeu, avec date + description + lien de preuve optionnel.
- **Personnalisation** — 6 templates, thème (couleurs, police, densité), **ordre et visibilité des sections** par section.
- **Live Preview** — aperçu temps réel type éditeur : zoom +/−, toggle desktop/mobile, plein écran, statut de sauvegarde honnête.
- **Export** — PDF + PNG haute qualité via rendu headless (Playwright), fidélité pixel-perfect avec l'aperçu (WYSIWYG).
- **Profil public** — page dédiée `/cv/[slug]` (portfolio, pas éditeur), QR code, boutons partager/export, og:image générée (aperçu correct sur Discord).
- **IA** — génération de présentation par analyse du profil, modes + tonalités, régénération guidée par instruction libre.

---

## Sommaire

- [Stack](#stack)
- [Architecture](#architecture)
- [Structure du monorepo](#structure-du-monorepo)
- [Prérequis](#prérequis)
- [Installation & démarrage](#installation--démarrage)
- [Compte & profil de démonstration](#compte--profil-de-démonstration)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Ajouter un jeu](#ajouter-un-jeu)
- [Ajouter un module générique](#ajouter-un-module-générique)
- [Recherche de jeux](#recherche-de-jeux)
- [Ajouter un template](#ajouter-un-template)
- [Badges & achievements](#badges--achievements)
- [Le moteur de génération IA](#le-moteur-de-génération-ia)
- [Export PDF/image](#export-pdfimage)
- [Profil public & partage](#profil-public--partage)
- [Tests, typecheck, build](#tests-typecheck-build)
- [Roadmap des phases](#roadmap-des-phases)

---

## Stack

| Domaine | Choix |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Style | Tailwind CSS |
| État client | Zustand (éditeur) + TanStack-style fetch (sauvegarde/génération) |
| Formulaires | react-hook-form + Zod |
| Validation | Zod (schémas partagés client/serveur) |
| Base de données | Prisma — **SQLite** en local/dev, **PostgreSQL** en production (JSONB pour les données hétérogènes par jeu) |
| Export | Playwright/Puppeteer headless (rendu serveur = fidélité pixel-perfect avec l'aperçu) |
| IA | Abstraction `AIProvider` : `mock` (offline, déterministe — par défaut) / `anthropic` (réel) / `gemini` (réel, **quasi gratuit** via le free tier Google Gemini) |

---

## Architecture

Cinq couches indépendantes communiquant par interfaces typées (jamais de couplage direct) :

```
UI (React/Next.js)                       ← composants génériques, aucune logique métier
Domain / Business Logic (packages/core)  ← pur TypeScript, testable sans React
  - moteur de modules de jeux
  - moteur de génération de CV (orchestration IA)
  - moteur de templates
  - moteur de visibilité/permissions des champs
  - moteur de statistiques agrégées
Services (packages/services)            ← AIProvider, Export, Storage, Share
Data (packages/data)                   ← définitions de jeux + modules + templates
Infrastructure                         ← Prisma, API routes Next.js, Auth, fournisseurs IA
```

Le domaine (`packages/core`, `packages/data`) ne dépend ni de Next.js ni du DOM : une future app Electron réutiliserait `core` et `data` tels quels, en ne remplaçant que la couche infrastructure.

---

## Structure du monorepo

```
gamer-cv/
├── apps/
│   └── web/                      ← Next.js (App Router, port 12000)
│       ├── app/                  ← pages, API routes (profiles, games, share, og, export, auth)
│       └── components/           ← composants spécifiques à l'app
├── packages/
│   ├── core/                     ← logique métier pure (modules, génération, visibilité, stats)
│   ├── data/                     ← définitions de jeux + modules + recherche
│   ├── services/                 ← AIProvider + adaptateurs, export Playwright, storage
│   ├── types/                    ← types + schémas Zod partagés
│   └── ui/                       ← (placeHolder) composants React génériques réutilisables
└── prisma/
    └── schema.prisma
```

---

## Prérequis

- **Node.js ≥ 20**
- **pnpm ≥ 11** (`corepack enable && corepack prepare pnpm@11 --activate`)
- **Chromium headless** pour l'export PDF/image (Playwright le télécharge, ou utiliser le binaire système `chromium` / la variable `PLAYWRIGHT_EXECUTABLE_PATH`)

---

## Installation & démarrage

```bash
# 1. Installer les dépendances
pnpm install

# 2. Préparer la base de données (SQLite local par défaut — fichier db.db)
pnpm db:generate
pnpm db:push          # crée les tables
pnpm db:seed          # (optionnel) données de démon

# 3. Lancer l'app en développement (port 12000)
pnpm --filter web dev
```

L'app est disponible sur <http://localhost:12000>.

> Sur les hôtes de travail, deux instances sont exposées : ports 12000 et 12001.

---

## Compte & profil de démonstration

Le seed (`prisma/seed.ts`, idempotent) crée un compte de démonstration et un profil public pour pouvoir explorer l'app sans rien saisir :

| | Valeur |
|---|---|
| Email | `demo@gamefolio.local` |
| Mot de passe | `demo1234` |
| Profil public | <http://localhost:12000/cv/demo> |

Le profil démo (Valorant + Minecraft, achievements, badges calculés) est **étiqueté « données non réelles »** — aucune donnée fictive n'est présentée comme réelle. Il sert de cible à la landing (« Voir un exemple » → `/cv/demo`) et à l'og:image.

```bash
pnpm db:seed          # crée/met à jour le compte + profil démo
```

---

## Variables d'environnement

Copier `.env.example` vers `.env` (à la racine) et renseigner :

| Variable | Description | Requis |
|---|---|---|
| `DATABASE_URL` | Chaîne Prisma. `file:./db.db` (SQLite) en local, URL PostgreSQL en prod. | oui |
| `AI_PROVIDER` | Fournisseur IA actif. `mock` (offline, déterministe) par défaut ; `gemini` (réel, **quasi gratuit** — free tier Google Gemini) ; `anthropic` (réel, Claude). | non (mock par défaut) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic. Requis uniquement si `AI_PROVIDER=anthropic`. | pour la vraie IA |
| `ANTHROPIC_MODEL` | Modèle Anthropic (défaut codé sinon). | optionnel |
| `GEMINI_API_KEY` | Clé API Google Gemini. Requis si `AI_PROVIDER=gemini` (alias `GOOGLE_API_KEY`). Création gratuite sur <https://aistudio.google.com/app/apikey>. | pour la vraie IA |
| `GEMINI_MODEL` | Modèle Gemini (défaut `gemini-2.0-flash`). | optionnel |
| `AUTH_SECRET` | Secret de session pour l'auth (≥ 16 caractères). | pour les comptes |
| `NEXT_PUBLIC_BASE_URL` | URL publique de base (pour les liens de partage / og:image). | pour le partage |
| `EXPORT_BASE_URL` | URL de rendu isolé pour l'export PDF/image et og:image. **Source de confiance unique** (anti-SSRF) — par défaut `NEXT_PUBLIC_BASE_URL`, jamais les en-têtes `Host`/`x-forwarded-*` du client. | recommandé (prod) |
| `PLAYWRIGHT_EXECUTABLE_PATH` | Chemin absolu vers un binaire Chromium si Playwright ne trouve pas le sien. | optionnel |

> **Sans clé IA**, l'app fonctionne entièrement et la génération de CV utilise le **mode mock** (offline, déterministe) pour pouvoir tester tout le pipeline. Pour une vraie rédaction IA, deux options : `AI_PROVIDER=gemini` + `GEMINI_API_KEY` (recommandé — quasi gratuit, free tier Google Gemini, **aucune carte bancaire requise**) ou `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. L'UI affiche un bandeau de statut explicite (« Mode hors-ligne — Mock » vs « Google Gemini (réel) » / « Anthropic (réel) ») — l'app ne prétend jamais faire de l'IA quand elle n'en fait pas. Le statut est aussi interrogable via `GET /api/ai/status`.

---

## Base de données

Le schéma Prisma (`prisma/schema.prisma`) utilise **SQLite** en développement (zéro config) et bascule sur **PostgreSQL** en production. Les champs spécifiques par jeu sont stockés en colonne `Json` (`moduleData`), validés à l'application par le schéma Zod composite du jeu — jamais de migration SQL par nouveau jeu.

Commandes utiles :

```bash
pnpm db:migrate    # créer/appliquer une migration
pnpm db:push       # synchroniser le schéma sans migration (dev)
pnpm db:generate   # régénérer le client Prisma
pnpm db:seed       # peupler la base de démon
```

---

## Ajouter un jeu

Un jeu = un fichier `packages/data/src/games/<id>.ts` + une ligne dans le registre. Zéro code UI.

```typescript
// packages/data/src/games/mon-jeu.ts
import { defineGame } from "@gamer-cv/core";

export const MonJeu = defineGame({
  id: "mon-jeu",
  name: "Mon Jeu",
  publisher: "Studio",
  developer: "Studio Dev",
  releaseYear: 2024,
  genres: ["FPS", "compétitif"],
  icon: "/icons/mon-jeu.svg",
  aliases: ["mj"],                  // synonymes de recherche (déduplication, pas de lignes dupliquées par plateforme)
  platforms: ["PC", "PS5", "Xbox"],
  modules: ["competitive", "characterbased", "weaponbased"],  // composition de modules
  gameData: {
    ranks: ["Bronze", "Argent", "Or"],
    roles: ["Attaquant", "Support"],
    characters: ["Hero A", "Hero B"],
    modes: ["Compétitif", "Deathmatch"],
  },
});
```

Puis l'ajouter au registre dans `packages/data/src/games/index.ts` :

```typescript
import { MonJeu } from "./mon-jeu";
export const games: GameDefinition[] = [
  // ...
  MonJeu,
];
```

Le moteur valide au démarrage que tous les modules référencés existent : un jeu mal configuré échoue immédiatement, jamais à l'exécution utilisateur.

> **Déduplication** : un même jeu multi-plateformes (Minecraft Java/Bedrock, Fortnite PC/console, Rocket League…) est **une seule entrée** avec `platforms` + `aliases`, jamais des lignes dupliquées.

Le catalogue actuel contient **72 jeux** couvrant FPS, MOBA, battle royale, course, sandbox/survival, RPG/solo, MMO/progression, gacha, Nintendo/PlayStation/Xbox, mobile et consoles legacy.

---

## Ajouter un module générique

Un module = un schéma Zod + des descripteurs de champs pour le rendu. Les modules sont **réutilisables** et composables : un jeu combine plusieurs modules.

```typescript
// packages/data/src/modules/mon-module.module.ts
import { z } from "zod";
import { defineModule } from "@gamer-cv/core";

export const MonModule = defineModule({
  id: "mon-module",
  schema: z.object({
    score: z.number().optional(),
    niveau: z.string().optional(),
  }),
  fields: [
    { key: "score", label: "Score", type: "number" },
    { key: "niveau", label: "Niveau", type: "text" },
  ],
});
```

Enregistrer dans `packages/data/src/modules/index.ts`. La composition des schémas utilise `last-write-wins` : les champs sémantiques partagés (`hours`, `completionPercent`, `accountLevel`) sont fusionnés sans collision lorsqu'ils signifient la même chose à travers les modules.

**28 modules composables** couvrent tous les types de jeux. Un jeu en combine plusieurs — par exemple Valorant = `competitive` + `characterbased` + `weaponbased` ; Minecraft = `sandbox` + `survival` + `building` + `redstone` + `creative` (aucun rang compétitif forcé) ; un jeu solo = `singleplayer` + `completion` + `achievement`.

| Catégorie | Modules |
|---|---|
| Compétition / FPS | `competitive`, `characterbased`, `weaponbased`, `rolebased` |
| Solo / progression | `singleplayer`, `progression`, `completion`, `achievement` |
| Sandbox / créatif | `sandbox`, `survival`, `building`, `redstone`, `creative`, `modding` |
| Social / multi | `clan`, `guild`, `mmo`, `serveradmin`, `contentcreator` |
| Genres | `moba`, `battleroyale`, `racing`, `cardgame`, `strategy`, `sports`, `fighting`, `speedrun`, `gacha` |

---

## Recherche de jeux

La recherche supporte le nom exact, la correspondance partielle, les fautes de frappe simples, les **alias** et le filtrage par genre/plateforme (`packages/data/src/search.ts`) :

- ordre de résolution : `exact` → `starts with` → `includes` → `genre` → `platform` → **fuzzy** (distance de Levenshtein ≤ 2, sur le nom + les alias).

Exemples : `lol` → League of Legends · `mc` → Minecraft · `rocket` → Rocket League · `minecaft` (faute) → Minecraft.

La recherche s'effectue côté serveur via `GET /api/games/search?q=` : le catalogue complet n'est jamais chargé dans le navigateur (pagination / lazy loading), ce qui reste performant même avec une base de plusieurs centaines de jeux.

---

## Ajouter un template

Un template = **présentation pure**, jamais de logique de contenu. Il reçoit un modèle de données normalisé (`NormalizedCVData`) et un objet de thème.

```tsx
// apps/web/src/components/preview/MonTemplate.tsx
import type { CVTemplateProps } from "./templates";

export function MonTemplate({ data, theme }: CVTemplateProps) {
  // rendu purement visuel à partir de data (déjà filtré par visibilité)
  return (/* ... */);
}
```

L'inscrire dans `apps/web/src/components/preview/templates.tsx` (le registre — source unique partagée entre l'aperçu live et la page d'export). Changer de template ne change que l'enveloppe visuelle, jamais les données ni leur sélection (gérée en amont par le moteur de visibilité).

**6 templates disponibles** : **Minimaliste** (dark, par défaut), **Gaming** (accents néon, compétitif/streamer), **Classique** (serif blanc, résumé pro), **Néon** (cyberpunk, texte lumineux), **Tech** (structure technique, mono), **Creator** (orienté créateur/streamer). Chacun reçoit le même `NormalizedCVData + ThemeConfig` et applique l'ordre/visibilité des sections via `resolveSectionOrder`.

**Ordre & visibilité des sections** : `ThemeConfig` supporte `sectionOrder: string[]` (réordonnancement) et `hiddenSections: string[]` (masquage). `resolveSectionOrder(theme, defaultIds)` (`template-utils.ts`) est le **seul point d'application** — partagé par les 6 templates, donc l'éditeur (`CustomizeStep`) et l'export rendent exactement les mêmes sections. L'architecture est extensible : ajouter une section = un id de plus, aucune logique métier dupliquée.

---

## Badges & achievements

### Badges (calculés)

Les badges sont **dérivés des données réelles** du profil — jamais attribués sans condition vérifiée. Le moteur (`packages/core/src/badges.ts`) expose une liste de définitions extensibles :

```typescript
interface BadgeDefinition {
  id: string;          // "1000-hours"
  name: string;        // "1000+ Heures"
  description: string; // "Plus de 1000 heures de jeu cumulées"
  icon: string;        // emoji ou identifiant d'icône
  category: string;    // "volume" | "playstyle" | "competition" | "mastery" | "diversity"...
  condition: (profile) => boolean;  // évaluée sur les données réelles
}
```

Le moteur (`computeBadges`) parcourt toutes les définitions et ne renvoie que celles dont la `condition` est vraie sur le profil. Exemples : `1000+ Heures` (somme des heures ≥ 1000), `Compétitif` (au moins un jeu avec rang compétitif), `FPS Main` (majorité d'heures en FPS), `Multigame` (≥ 3 jeux), `Builder` (Minecraft + projet construction), `Tournament Player` (compétition renseignée), `Achievement Hunter`, `Collector`. **Ajouter un badge = une définition**, aucune modification d'UI.

### Achievements (saisis)

Les achievements sont **renseignés par le joueur** dans le wizard, liés à un jeu, avec :

- un titre et une description,
- le jeu concerné (`gameId`),
- une date optionnelle,
- un lien de preuve optionnel (VOD, screenshot…).

Ils sont stockés dans `GamerProfile.achievements` (JSON), validés par Zod, et rendus par tous les templates via `resolveSectionOrder` (section « Achievements »).

---

## Le moteur de génération IA

Le but V2 : l'IA **analyse et comprend** le profil au lieu de reformatter. Le pipeline (détail dans `packages/core/src/generation` et `packages/services/src/ai`) :

```
Données utilisateur
   → enrichissement du contexte (par jeu)
   → analyse du profil + déduction des tendances
   → rédaction structurée (JSON)
   → validation Zod
   → vérification anti-hallucination
   → CV final
```

1. **Sérialisation + visibilité** : seuls les champs remplis sont envoyés (les champs vides ne le sont jamais — l'IA ne peut pas les « compléter »). La visibilité (`hidden`/`private`) est ré-appliquée côté serveur avant le prompt. Les champs numériques vides (qui produisent `NaN`) sont **explicitement écartés** pour ne jamais fuiter vers le modèle.
2. **Enrichissement du contexte (`enrichForGeneration`)** : chaque jeu reçoit son `__context` (nom, genres, modules, rangs/rôles/personnages/modes du catalogue) et son champ libre (`freeText`) est remonté au premier niveau. L'IA interprète ainsi les valeurs **par jeu** : un rang « Diamant » n'a pas la même signification selon le jeu, et « 100 % de complétion » diffère de « Champion ».
3. **Prompt système d'analyse (`buildSystemPrompt`)** : rôle défini, consigne explicite d'**ANALYSER** puis **déduire des tendances** (orientation compétitive, polyvalence, expérience créative…), puis **rédiger** — jamais reformatter. Interdiction d'inventer une statistique, un rang, une compétition, un record ou une performance non présent.
4. **Modes & tonalités** : 5 modes (`standard`, `rapide`, `détaillé`, `compétitif`, `portfolio`) et 8 tonalités (`professionnel`, `gaming`, `compétitif`, `sobre`, `dynamique`, `très détaillé`, `court`, `naturel`) ajustent la longueur et l'accent mis.
5. **Sortie JSON structurée V2** : validée par Zod avant d'être renvoyée.

   ```json
   {
     "profileSummary": "…",
     "gamingIdentity": "…",
     "strengths": ["…", "…"],
     "experience": "…",
     "games": [
       { "gameId": "valorant", "title": "Valorant", "description": "…", "highlights": ["…"] }
     ]
   }
   ```

   Un `.refine()` rejette un JSON vide ou de forme étrangère. Les données sources restent **séparées** du texte généré (`generatedText` vs `moduleData`) : une régénération ne touche jamais les données originales.
6. **Vérification post-génération (`verifyFacts`)** : extraction des nombres et noms propres du texte produit, comparaison avec les données d'entrée **et** le `gameMetaBlob` (construit depuis l'enrichissement — noms de jeux, rangs, agents…). Tout écart est signalé à l'utilisateur (« à vérifier »). Les noms propres légitimes issus du catalogue ne déclenchent plus de faux positifs.

**Régénération intelligente** : un nouvel appel avec le texte précédent + les données brutes + l'instruction libre de l'utilisateur (« rends-le plus professionnel », « mets Minecraft en avant », « retire les informations personnelles », « plus court »). L'IA reçoit toujours les données sources.

**Statut fournisseur honnête** : `GET /api/ai/status` renvoie `{ providerId, real, configured }`. L'UI affiche un bandeau explicite — « Mode hors-ligne — Mock » (offline, déterministe) ou « Anthropic (réel) ». L'app ne simule jamais une vraie génération en production.

L'interface `AIProvider` rend le fournisseur remplaçable sans toucher au domaine (`mock`, `anthropic`, `gemini` ; `openai`, `openrouter` prévus). Chaque adapter partage le même prompt (`prompt.ts`) et la même extraction JSON, donc changer de fournisseur ne change ni ce qu'on demande au modèle ni la validation de sa réponse.

---

## Export PDF/image

L'export utilise un **rendu serveur headless** (Playwright/Puppeteer) — pas `html2canvas`/`jsPDF` côté client. Le même composant de template que l'aperçu est rendu dans une page isolée (`/export`), puis capturé :

- **PDF** : `page.pdf({ format: 'A4', printBackground: true })` — pagination correcte, aucun élément coupé.
- **PNG** : `page.screenshot()` — image haute résolution.

Ce qui est affiché dans l'aperçu est exactement ce qui est exporté (WYSIWYG : l'aperçu live et l'export rendent le **même** `CVTemplate` via le même resolver). Le service d'export est isolé (`packages/services/src/export`) car le lancement de Chromium est coûteux et incompatible avec certains environnements serverless purs. L'API `POST /api/export` est limitée en taux (spawner un browser est cher) et renvoie le binaire avec les bons `Content-Type`/`Content-Disposition`.

> **Sécurité (anti-SSRF)** : l'URL de rendu isolé est dérivée de la variable d'environnement `EXPORT_BASE_URL` (à défaut `NEXT_PUBLIC_BASE_URL`), **jamais** des en-têtes `Host`/`x-forwarded-*` contrôlés par le client. Chromium ne navigue donc que vers la page de rendu du serveur lui-même — impossible de le faire pointer vers un hôte arbitraire via un en-tête usurpé.

L'**og:image** des pages publiques (`/cv/[slug]`) est générée via la même route d'export headless (`/api/og/[slug]`, PNG 1200×630), qui partage la même protection anti-SSRF.

---

## Profil public & partage

La page publique `/cv/[slug]` est un **portfolio dédié** (server component), très différent de l'éditeur :

- avatar, pseudo, bio, badges (calculés), jeux + statistiques, achievements, expériences,
- rendu via le **même moteur de visibilité** (`normalizeProfile`) — les champs `hidden`/`private` sont filtrés **côté serveur** avant tout rendu public (jamais en clair dans le HTML),
- QR code de partage (lib `qrcode`),
- boutons **partager** (copier le lien) + **export PDF/PNG** (téléchargement direct),
- meta `openGraph` / `twitter` dynamiques avec `og:image` générée (aperçu correct quand le lien est envoyé sur Discord).

Le partage se gère via `POST /api/share/[id]` (toggle `isPublic` + mint/revocation d'un `slug` nanoid 10 chars, retried on collision). La révocation annule le slug. Le dashboard liste les profils cloud de l'utilisateur avec actions ouvrir / modifier / dupliquer / partager / exporter / supprimer.

> **Local-first par défaut** : aucun compte n'est requis pour construire un profil (sauvegarde IndexedDB automatique). Le cloud est opt-in derrière une session — le profil public n'existe que si l'utilisateur choisit explicitement de le partager.

---

## Tests, typecheck, build

```bash
pnpm test         # tous les tests (vitest) — 167 tests
pnpm typecheck    # tsc --noEmit sur tous les packages
pnpm build        # build de tous les packages + Next.js
pnpm --filter web build   # build uniquement l'app web
```

Au moment de la rédaction : **167 tests passent** (types 6, core 54, data 18, services 10, web 79), typecheck et build verts.

---

## Roadmap des phases

- ✅ **Phase 0 — Fondations** : monorepo, types/schémas, moteur de modules, tests du moteur.
- ✅ **Phase 1 — Wizard sans IA** : parcours complet, formulaires dynamiques, aperçu live, sauvegarde locale.
- ✅ **Phase 2 — IA** : `AIProvider`, génération + vérification anti-hallucination, régénération guidée.
- ✅ **Phase 3 — Export** : rendu headless serveur, PDF + image, fidélité avec l'aperçu.
- ✅ **Phase 4 — Templates & personnalisation** : templates supplémentaires, thème personnalisable.
- ✅ **Phase 5 — Comptes & partage** : auth optionnelle, cloud, pages publiques, QR code.
- ✅ **Phase 6 — Scale** : extension du catalogue, nouveaux modules, statistiques agrégées, mode d'édition avancé, og:image.
- ✅ **V2 — Moteur intelligent & vraie IA** : base de jeux enrichie (72 jeux, 28 modules composables, aliases/déduplication, métadonnées), recherche tolérante aux fautes (serveur), pipeline IA par **analyse** (enrichissement du contexte par jeu, modes + tonalités, `GeneratedText` V2 structuré), `verifyFacts` avec `gameMetaBlob`, statut fournisseur honnête (`/api/ai/status`), correctif NaN multi-couches.
- ✅ **V2 — Audit & robustesse** : correctif **anti-SSRF** sur l'export/og (URL de rendu issue d'`EXPORT_BASE_URL`, jamais des en-têtes client) ; robustesse IA (`max_tokens` 4096, retry sur JSON tronqué, `GenerationFormatError` ré-essayable) ; rendu template propre (labels FR + filtrage des champs vides, plus de mur de « — ») ; **normalisation de `generatedText`** à chaque point d'entrée (hydrate / cloud / éditions) — fixe le crash `/create` (`generated.specializations.length` sur donnée périmée) ; déduplication des profils cloud (`cloudProfileId`) ; `DELETE /api/profiles/[id]`.
- ✅ **V2 — Provider Google Gemini** : adapter `GeminiProvider` (REST natif, zéro SDK), branché dans la factory (`AI_PROVIDER=gemini` + `GEMINI_API_KEY`, alias `GOOGLE_API_KEY`). Helpers prompt/JSON extraits dans `prompt.ts` partagé (DRY avec Anthropic). Statut honnête étendu (`/api/ai/status` reconnaît Gemini comme réel). **Quasi gratuit** : free tier Google Gemini, aucune CB requise — idéal pour tester la vraie génération IA.
- ✅ **Refonte plateforme gaming** : repositionnement « portfolio gaming complet » (le CV devient un format d'export du profil). **6 templates** visuellement distincts (Minimaliste, Gaming, Classique, Néon, Tech, Creator). **Badges** calculés depuis les données réelles (`computeBadges`, 10 définitions extensibles). **Achievements** saisis par le joueur, liés à un jeu (date + description + lien de preuve). **Personnalisation étendue** : ordre + visibilité des sections (`sectionOrder`/`hiddenSections` via `resolveSectionOrder`, single chokepoint partagé par les 6 templates). **Live Preview type éditeur** : zoom +/−, toggle desktop/mobile (390px), plein écran, **statut de sauvegarde honnête** (timestamp réel IndexedDB). **Avatar** : aperçu circulaire live + validation URL (fallback monogramme gamerTag). **Galerie de templates** : vraies vignettes `CVTemplate` mises à l'échelle (pas des swatches). **Seed DB** : compte démo (`demo@gamefolio.local` / `demo1234`) + profil public `/cv/demo` (idempotent, étiqueté « données non réelles »). **og:image vérifiée live** (`/api/og/demo` → vrai PNG 1200×630 via headless). **167 tests** verts, typecheck + build verts.

Chaque phase est livrable et utilisable seule.

---

## Licence

MIT