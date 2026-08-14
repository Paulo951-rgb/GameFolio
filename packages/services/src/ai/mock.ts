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

    const summary = `profil de joueur ${gamerTag}.`;
    const strengths = playerTypes.length
      ? [`profil de jeu : ${playerTypes.join(", ")}.`]
      : [];

    const perGame: Record<string, string> = {};
    for (const g of games) {
      const gameId = String(g.gameId ?? "");
      if (!gameId) continue;
      const parts: string[] = [];
      const md = (g.moduleData as Record<string, unknown> | undefined) ?? {};
      if (md.currentRank) parts.push(`rang actuel : ${md.currentRank}.`);
      if (md.highestRank) parts.push(`meilleur rang : ${md.highestRank}.`);
      if (md.hours) parts.push(`environ ${md.hours} heures jouées.`);
      if (md.roles) parts.push(`rôles : ${(md.roles as string[]).join(", ")}.`);
      if (g.freeText) parts.push(String(g.freeText));
      perGame[gameId] = parts.join(" ") || "aucune information saisie.";
    }

    const structured = { summary, strengths, perGame };
    if (input.instruction) {
      // Acknowledge the instruction deterministically so regeneration tests
      // can assert the instruction reached the provider.
      structured.summary = `${structured.summary} (instruction appliquée : ${input.instruction})`;
    }
    return { structured, raw: JSON.stringify(structured, null, 2) };
  }
}
