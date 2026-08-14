# GameFolio

> **Gamer CV** — un moteur intelligent de création de profil gamer : base de données de jeux pilotée par les données + génération de CV par IA qui **analyse et comprend** le parcours du joueur au lieu de reformatter les données.

GameFolio génère des CV gaming (export PDF/image, partage public) sans jamais coder un jeu en dur dans un composant React. Chaque jeu est une **définition de données** (composition de modules + métadonnées) ; un formulaire dynamique et un aperçu génériques interprètent ces schémas. Ajouter un jeu = un fichier, pas de code UI.

La génération du CV suit un vrai pipeline d'analyse : les données saisies sont d'abord **enrichies du contexte de chaque jeu** (métadonnées, rangs, rôles, personnages), puis l'IA **analyse le profil**, en déduit les points forts et tendances, et **rédige** un CV structuré — sans jamais inventer de fait absent des données sources (pipeline anti-hallucination : seules les valeurs saisies sont envoyées, la sortie JSON est validée par Zod, puis vérifiée post-génération).

> **V2** — moteur intelligent + vraie IA : 71 jeux, 28 modules composables, recherche tolérante aux fautes, génération IA par analyse (modes + tonalités), statut fournisseur honnête.

---

## Sommaire

- [Stack](#stack)
- [Architecture](#architecture)
- [Structure du monorepo](#structure-du-monorepo)
- [Prérequis](#prérequis)
- [Installation & démarrage](#installation--démarrage)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Ajouter un jeu](#ajouter-un-jeu)
- [Ajouter un module générique](#ajouter-un-module-générique)
- [Recherche de jeux](#recherche-de-jeux)
- [Ajouter un template](#ajouter-un-template)
- [Le moteur de génération IA](#le-moteur-de-génération-ia)
- [Export PDF/image](#export-pdfimage)
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
| IA | Abstraction `AIProvider` : `mock` (offline, déterministe — par défaut) / `anthropic` (réel) |

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

## Variables d'environnement

Copier `.env.example` vers `.env` (à la racine) et renseigner :

| Variable | Description | Requis |
|---|---|---|
| `DATABASE_URL` | Chaîne Prisma. `file:./db.db` (SQLite) en local, URL PostgreSQL en prod. | oui |
| `AI_PROVIDER` | Fournisseur IA actif. `mock` (offline, déterministe) par défaut ; `anthropic` pour une vraie génération. | non (mock par défaut) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic. Requis uniquement si `AI_PROVIDER=anthropic`. | pour la vraie IA |
| `ANTHROPIC_MODEL` | Modèle Anthropic (défaut codé sinon). | optionnel |
| `AUTH_SECRET` | Secret de session pour l'auth (≥ 16 caractères). | pour les comptes |
| `NEXT_PUBLIC_BASE_URL` | URL publique de base (pour les liens de partage / og:image). | pour le partage |
| `EXPORT_BASE_URL` | URL de rendu isolé si différente du host de requête (déploiements avancés). | optionnel |
| `PLAYWRIGHT_EXECUTABLE_PATH` | Chemin absolu vers un binaire Chromium si Playwright ne trouve pas le sien. | optionnel |

> **Sans clé IA**, l'app fonctionne entièrement et la génération de CV utilise le **mode mock** (offline, déterministe) pour pouvoir tester tout le pipeline. Pour une vraie rédaction IA, passez `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. L'UI affiche un bandeau de statut explicite (« Mode hors-ligne — Mock » vs « Anthropic (réel) ») — l'app ne prétend jamais faire de l'IA quand elle n'en fait pas. Le statut est aussi interrogable via `GET /api/ai/status`.

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

Le catalogue actuel contient **71 jeux** couvrant FPS, MOBA, battle royale, course, sandbox/survival, RPG/solo, MMO/progression, gacha, Nintendo/PlayStation/Xbox, mobile et consoles legacy.

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

La recherche s'effectue côté serveur via `GET /api/search?q=` : le catalogue complet n'est jamais chargé dans le navigateur (pagination / lazy loading), ce qui reste performant même avec une base de plusieurs centaines de jeux.

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

L'inscrire dans `apps/web/src/components/preview/templates.tsx`. Changer de template ne change que l'enveloppe visuelle, jamais les données ni leur sélection (gérée en amont par le moteur de visibilité).

4 templates disponibles : **Minimaliste**, **Gaming**, **Classique**, **Néon**.

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

L'interface `AIProvider` rend le fournisseur remplaçable sans toucher au domaine (`mock`, `anthropic` ; `openai`, `gemini`, `openrouter` prévus).

---

## Export PDF/image

L'export utilise un **rendu serveur headless** (Playwright/Puppeteer) — pas `html2canvas`/`jsPDF` côté client. Le même composant de template que l'aperçu est rendu dans une page isolée (`/export`), puis capturé :

- **PDF** : `page.pdf({ format: 'A4', printBackground: true })`
- **PNG/JPEG** : `page.screenshot()`

Ce qui est affiché dans l'aperçu est exactement ce qui est exporté. Le service d'export est isolé (`packages/services/src/export`) car le lancement de Chromium est coûteux et incompatible avec certains environnements serverless purs.

L'**og:image** des pages publiques (`/cv/[slug]`) est générée via la même route d'export (`/api/og/[slug]`).

---

## Tests, typecheck, build

```bash
pnpm test         # tous les tests (vitest) — 114 tests
pnpm typecheck    # tsc --noEmit sur tous les packages
pnpm build        # build de tous les packages + Next.js
pnpm --filter web build   # build uniquement l'app web
```

Au moment de la rédaction : **114 tests passent** (types 6, core 45, data 16, services 5, web 42), typecheck et build verts.

---

## Roadmap des phases

- ✅ **Phase 0 — Fondations** : monorepo, types/schémas, moteur de modules, tests du moteur.
- ✅ **Phase 1 — Wizard sans IA** : parcours complet, formulaires dynamiques, aperçu live, sauvegarde locale.
- ✅ **Phase 2 — IA** : `AIProvider`, génération + vérification anti-hallucination, régénération guidée.
- ✅ **Phase 3 — Export** : rendu headless serveur, PDF + image, fidélité avec l'aperçu.
- ✅ **Phase 4 — Templates & personnalisation** : templates supplémentaires, thème personnalisable.
- ✅ **Phase 5 — Comptes & partage** : auth optionnelle, cloud, pages publiques, QR code.
- ✅ **Phase 6 — Scale** : extension du catalogue, nouveaux modules, statistiques agrégées, mode d'édition avancé, og:image.
- ✅ **V2 — Moteur intelligent & vraie IA** : base de jeux enrichie (71 jeux, 28 modules composables, aliases/déduplication, métadonnées), recherche tolérante aux fautes (serveur), pipeline IA par **analyse** (enrichissement du contexte par jeu, modes + tonalités, `GeneratedText` V2 structuré), `verifyFacts` avec `gameMetaBlob`, statut fournisseur honnête (`/api/ai/status`), correctif NaN multi-couches.

Chaque phase est livrable et utilisable seule.

---

## Licence

MIT