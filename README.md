# GameFolio

> **Gamer CV** — un moteur de schémas de jeux piloté par les données, couplé à un moteur de génération de texte contraint (IA qui ne peut pas halluciner).

GameFolio génère des CV gaming (export PDF/image, partage public) sans jamais coder un jeu en dur dans un composant React. Chaque jeu est une **définition de données** (composition de modules + métadonnées) ; un formulaire dynamique et un aperçu génériques interprètent ces schémas. Ajouter un jeu = un fichier, pas de code UI.

Le texte de CV est produit par une IA via un pipeline anti-hallucination : seules les données saisies sont envoyées, la sortie est structurée en JSON, puis vérifiée post-génération (les nombres/noms absents des données sources sont signalés « à vérifier »).

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
| IA | Abstraction `AIProvider` (Anthropic par défaut, remplaçable) |

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
| `AI_PROVIDER` | Fournisseur IA actif (`anthropic` par défaut). | pour la génération IA |
| `ANTHROPIC_API_KEY` | Clé API Anthropic. | pour la génération IA |
| `ANTHROPIC_MODEL` | Modèle Anthropic (défaut codé sinon). | optionnel |
| `AUTH_SECRET` | Secret de session pour l'auth (NextAuth-like). | pour les comptes (v2) |
| `NEXT_PUBLIC_BASE_URL` | URL publique de base (pour les liens de partage / og:image). | pour le partage |
| `EXPORT_BASE_URL` | URL de rendu isolé si différente du host de requête (déploiements avancés). | optionnel |
| `PLAYWRIGHT_EXECUTABLE_PATH` | Chemin absolu vers un binaire Chromium si Playwright ne trouve pas le sien. | optionnel |

Sans clé IA, l'app fonctionne entièrement (création, aperçu, export, sauvegarde locale) — seule la génération de texte IA est indisponible.

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
  genres: ["FPS", "compétitif"],
  icon: "/icons/mon-jeu.svg",
  modules: ["competitive"],            // composition de modules existants
  gameData: {
    ranks: ["Bronze", "Argent", "Or"],
    roles: ["Attaquant", "Support"],
    characters: ["Hero A", "Hero B"],
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

Le catalogue actuel contient **44 jeux** couvrant FPS, MOBA, battle royale, course, sandbox/survival, solo, MMO/progression et gacha.

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

8 modules génériques couvrent la grande majorité des jeux : `competitive`, `singleplayer`, `sandbox`, `progression`, `clan`, `racing`, `battleroyale`, `gacha`.

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

Pipeline anti-hallucination en 4 étapes (détail dans `packages/core/src/generation` et `packages/services/src/ai`) :

1. **Sérialisation** : seuls les champs remplis sont envoyés (les champs vides ne le sont jamais — l'IA ne peut pas les « compléter »). La visibilité est ré-appliquée côté serveur avant le prompt.
2. **Prompt système strict** : rôle défini, interdiction explicite d'inventer une statistique, un rang ou un fait non présent.
3. **Sortie JSON structurée** : `{ summary, strengths[], perGame: { [gameId]: text } }`, validée par Zod côté serveur avant d'être renvoyée.
4. **Vérification post-génération** : extraction des nombres/noms du texte produit, comparaison avec les données d'entrée. Tout écart est signalé à l'utilisateur (« à vérifier »), ou déclenche une régénération (1 retry).

Le texte généré est stocké **séparément** des données brutes (`generatedText` vs `moduleData`) : une régénération ne touche jamais les données sources.

**Régénération guidée** : un nouvel appel avec le texte précédent + les données brutes + l'instruction utilisateur (« plus court », « sans mentionner mon âge »).

**Mode avancé** : édition directe du texte généré (résumé, points forts, par jeu) + réordonnancement des jeux, sans repasser par l'IA.

L'interface `AIProvider` rend le fournisseur remplaçable sans toucher au domaine (`anthropic`, `mock` pour les tests ; `openai`, `gemini`, `openrouter` prévus).

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
pnpm test         # tous les tests (vitest) — 91 tests
pnpm typecheck    # tsc --noEmit sur tous les packages
pnpm build        # build de tous les packages + Next.js
pnpm --filter web build   # build uniquement l'app web
```

Au moment de la rédaction : **91 tests passent** (core 33, data 12, services 5, web 41), typecheck et build verts.

---

## Roadmap des phases

- ✅ **Phase 0 — Fondations** : monorepo, types/schémas, moteur de modules, tests du moteur.
- ✅ **Phase 1 — Wizard sans IA** : parcours complet, formulaires dynamiques, aperçu live, sauvegarde locale.
- ✅ **Phase 2 — IA** : `AIProvider`, génération + vérification anti-hallucination, régénération guidée.
- ✅ **Phase 3 — Export** : rendu headless serveur, PDF + image, fidélité avec l'aperçu.
- ✅ **Phase 4 — Templates & personnalisation** : templates supplémentaires, thème personnalisable.
- ✅ **Phase 5 — Comptes & partage** : auth optionnelle, cloud, pages publiques, QR code.
- ✅ **Phase 6 — Scale** : extension du catalogue (44 jeux), nouveaux modules (racing, battleroyale, gacha), statistiques agrégées, mode d'édition avancé, og:image.

Chaque phase est livrable et utilisable seule.

---

## Licence

MIT