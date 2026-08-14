import { games, moduleRegistry } from "../packages/data/src";
import { resolveGame } from "../packages/core/src";

let problems = 0;
const ids = new Map<string, number>();
const names = new Map<string, number>();

for (const g of games) {
  ids.set(g.id, (ids.get(g.id) ?? 0) + 1);
  names.set(g.name, (names.get(g.name) ?? 0) + 1);

  let resolved;
  try {
    resolved = resolveGame(g, moduleRegistry);
  } catch (e: any) {
    console.log(`[UNKNOWN MODULE] ${g.id}: ${e.message}`);
    problems++;
    continue;
  }

  const expected = new Set<string>();
  for (const f of resolved.fields) {
    if (f.optionsSource && f.optionsSource.startsWith("game.")) {
      expected.add(f.optionsSource.slice("game.".length));
    }
  }
  for (const key of expected) {
    if (!(key in g.gameData)) {
      console.log(`[MISSING GAMEDATA] ${g.id}: optionsSource "game.${key}" absent (modules: ${g.modules.join(",")})`);
      problems++;
    } else {
      const v = g.gameData[key];
      if (!Array.isArray(v) || v.length === 0) {
        console.log(`[EMPTY GAMEDATA] ${g.id}: "game.${key}" present but empty/non-array`);
        problems++;
      }
    }
  }

  if (!g.genres || g.genres.length === 0) { console.log(`[NO GENRES] ${g.id}`); problems++; }
  if (!g.platforms || g.platforms.length === 0) { console.log(`[NO PLATFORMS] ${g.id}`); problems++; }
}

for (const [id, n] of ids) if (n > 1) { console.log(`[DUP ID] ${id} x${n}`); problems++; }
for (const [name, n] of names) if (n > 1) { console.log(`[DUP NAME] ${name} x${n}`); problems++; }

console.log(`\nTotal games: ${games.length}`);
console.log(`Problems found: ${problems}`);
