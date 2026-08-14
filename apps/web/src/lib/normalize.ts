import {
  filterPersonalInfo,
  filterGameEntry,
} from "@gamer-cv/core";
import type {
  GamerProfile,
  NormalizedCVData,
} from "@gamer-cv/types";

/**
 * Build the visibility-filtered, normalized view of a profile. This is the
 * single chokepoint shared by:
 *  - LivePreviewPane (client)
 *  - the AI generation API routes (server, defense-in-depth: the server re-
 *    filters even though the client claims it already did, per §3 "jamais
 *    confiance aveugle dans les données client")
 *  - the future export/headless render (server)
 *
 * Private/hidden fields never survive this call, guaranteeing they can't reach
 * the AI prompt or the public page.
 */
export function normalizeProfile(profile: GamerProfile): NormalizedCVData {
  const personalInfo = filterPersonalInfo(profile.personalInfo);
  const games = profile.games
    .filter((g) => g.gameId !== "")
    .map((g) => filterGameEntry(g, profile.personalInfo.visibility))
    .filter((g): g is NonNullable<typeof g> => g !== null);
  return {
    personalInfo,
    playerTypes: profile.playerTypes,
    games,
    generated: profile.generatedText,
  };
}
