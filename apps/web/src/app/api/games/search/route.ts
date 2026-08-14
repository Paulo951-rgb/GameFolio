import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@gamer-cv/data";

/**
 * GET /api/games/search?q=...
 * Autocomplete over the game catalog. The catalog is static so this is a thin
 * server wrapper (kept as a route for the future DB-backed catalogue and for
 * clients that prefer a network call over importing the registry).
 */
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) {
    return NextResponse.json({ games: [] });
  }
  const games = searchGames(q).slice(0, 20).map((g) => ({
    id: g.id,
    name: g.name,
    publisher: g.publisher,
    genres: g.genres,
    icon: g.icon,
  }));
  return NextResponse.json({ games });
}
