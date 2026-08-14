import type {
  AIProvider,
  GenerationInput,
  GenerationOutput,
} from "@gamer-cv/types";

/**
 * MockProvider — deterministic AIProvider for tests and local dev without an
 * API key. It builds a GeneratedText-shaped object ENTIRELY from the input
 * data (echoing only facts present in the serialized profile), which makes the
 * anti-hallucination pipeline exercisable end-to-end without spending tokens
 * or touching the network.
 *
 * The mock mimics the V2 analysis-driven shape: it deduces GENERAL tendencies
 * (competitive orientation, versatility) from the data rather than inventing
 * facts, and writes per-game descriptions sourced from the entry's fields +
 * freeText. It never fabricates ranks/hours/characters.
 */
export class MockProvider implements AIProvider {
  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const data = input.profileData as Record<string, unknown>;
    const gamerTag = String(
      data.gamerTag ??
        (data.personalInfo as Record<string, unknown> | undefined)?.gamerTag ??
        "Joueur",
    );
    const playerTypes = (data.playerTypes as string[] | undefined) ?? [];
    const games =
      (data.games as Array<Record<string, unknown>> | undefined) ?? [];

    // Deduce general tendencies from the data (allowed: tendencies, not facts).
    const competitiveGames = games.filter((g) => {
      const ctx = g.__context as { modules?: string[] } | undefined;
      return ctx?.modules?.some((m) => m === "competitive" || m === "battleroyale");
    });
    const creativeGames = games.filter((g) => {
      const ctx = g.__context as { modules?: string[] } | undefined;
      return ctx?.modules?.some(
        (m) => m === "building" || m === "creative" || m === "redstone" || m === "modding",
      );
    });
    const totalHours = games.reduce((sum, g) => {
      const md = (g.moduleData as Record<string, unknown> | undefined) ?? {};
      const h = typeof md.hours === "number" ? md.hours : 0;
      return sum + h;
    }, 0);

    const tendencies: string[] = [];
    if (competitiveGames.length >= 2)
      tendencies.push("profil principalement orienté vers la compétition et la maîtrise mécanique");
    if (creativeGames.length >= 1)
      tendencies.push("expérience technique et créative affirmée");
    if (games.length >= 3)
      tendencies.push("polyvalence sur plusieurs jeux et styles");
    if (totalHours >= 1000)
      tendencies.push("forte expérience gaming cumulée");

    const profileSummary = `présentation de ${gamerTag}.`;
    const gamingIdentity = tendencies.length
      ? tendencies.join(" ; ") + "."
      : `joueur avec un profil ${playerTypes.join(", ") || "varié"}.`;
    const strengths = tendencies.length ? tendencies : (playerTypes.length ? [`profil de jeu : ${playerTypes.join(", ")}`] : []);
    // Avoid emitting raw count numbers that aren't in the input (would be a
    // false-positive for verifyFacts). "expérience cumulée" + total hours
    // (which IS in the input) is a safe, sourced summary.
    const experience = totalHours > 0
      ? `expérience gaming cumulée d'environ ${totalHours} heures.`
      : "expérience gaming sur plusieurs titres.";
    const specializations: string[] = [];
    const seenRoles = new Set<string>();
    for (const g of games) {
      const md = (g.moduleData as Record<string, unknown> | undefined) ?? {};
      const roles = md.roles as string[] | undefined;
      if (roles) for (const r of roles) if (!seenRoles.has(r)) { seenRoles.add(r); specializations.push(r); }
    }

    const generatedGames = games.map((g) => {
      const gameId = String(g.gameId ?? "");
      const ctx = g.__context as { name?: string } | undefined;
      const title = ctx?.name ?? gameId;
      const md = (g.moduleData as Record<string, unknown> | undefined) ?? {};
      const parts: string[] = [];
      if (md.currentRank) parts.push(`rang actuel : ${md.currentRank}`);
      if (md.highestRank) parts.push(`meilleur rang : ${md.highestRank}`);
      if (md.hours) parts.push(`environ ${md.hours} heures jouées`);
      if (md.roles) parts.push(`rôles : ${(md.roles as string[]).join(", ")}`);
      if (md.mainCharacters) parts.push(`personnages : ${(md.mainCharacters as string[]).join(", ")}`);
      if (g.freeText) parts.push(String(g.freeText));
      const highlights = parts.slice(0, 3);
      const description = parts.length ? parts.join(" ; ") + "." : "informations saisies pour ce jeu.";
      return { gameId, title, description, highlights };
    });

    // Legacy fields kept populated for backward-compat templates.
    const perGame: Record<string, string> = {};
    for (const gg of generatedGames) perGame[gg.gameId] = gg.description;
    const summary = `${profileSummary} ${gamingIdentity}`;

    const structured = {
      profileSummary,
      gamingIdentity,
      strengths,
      experience,
      specializations,
      performance: competitiveGames.length ? "orientation compétitive avec rangs suivis." : undefined,
      games: generatedGames,
      summary,
      perGame,
    };
    if (input.instruction) {
      // Acknowledge the instruction deterministically so regeneration tests
      // can assert the instruction reached the provider.
      structured.summary = `${summary} (instruction appliquée : ${input.instruction})`;
      structured.profileSummary = `${profileSummary} (instruction appliquée : ${input.instruction})`;
    }
    return { structured, raw: JSON.stringify(structured, null, 2) };
  }
}
