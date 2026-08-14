import type { GameDefinition } from "@gamer-cv/types";

/**
 * Multi-strategy catalogue search (§24). Results are ranked and de-duplicated:
 *   1. exact name / alias match  (best)
 *   2. name / alias starts-with
 *   3. name / alias includes
 *   4. genre match
 *   5. platform match
 *   6. fuzzy (Levenshtein ≤ 2, only when nothing stronger matched) — handles
 *      simple typos like "minecaft", "roquet league".
 *
 * Only fully-resolved games are searchable (the registry guarantees modules
 * resolved at load time), so a search hit is always safe to render a form for.
 */

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

interface Scored {
  game: GameDefinition;
  score: number;
}

export function searchGames(catalogue: GameDefinition[], query: string, limit = 10): GameDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalogue.slice(0, limit);

  const scored: Scored[] = [];
  for (const game of catalogue) {
    const name = game.name.toLowerCase();
    const aliases = (game.aliases ?? []).map((a) => a.toLowerCase());
    const candidates = [name, ...aliases];

    let score = 0;
    if (candidates.some((c) => c === q)) score = 1000;
    else if (candidates.some((c) => c.startsWith(q))) score = 800 - (name.startsWith(q) ? 0 : 50);
    else if (candidates.some((c) => c.includes(q))) score = 600 - (name.includes(q) ? 0 : 50);
    else if (game.genres.some((g) => g.toLowerCase().includes(q))) score = 300;
    else if ((game.platforms ?? []).some((p) => p.toLowerCase().includes(q))) score = 200;
    else {
      // fuzzy fallback: closest candidate within typo tolerance
      const best = Math.min(...candidates.map((c) => levenshtein(q, c)));
      if (best > 0 && best <= 2 && q.length >= 3) score = 100 - best * 20;
    }

    if (score > 0) scored.push({ game, score });
  }

  scored.sort((a, b) => b.score - a.score || a.game.name.localeCompare(b.game.name));
  return scored.slice(0, limit).map((s) => s.game);
}
