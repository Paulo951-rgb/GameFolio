import { z } from "zod";

/**
 * Aggregated stats over a profile's games (architecture doc Phase 6).
 *
 * STRICT NON-AGGREGATION RULE (risk #2 / solution #2): a stat is only computed
 * from values that are actually present in the source data. We never average,
 * infer, or synthesise a number for a game that didn't provide one. Counts are
 * always honest; sums/averages explicitly drop missing values and report how
 * many were included so a consumer can never mistake "3 of 10 games" for "10".
 */
export const ProfileStatsSchema = z.object({
  totalGames: z.number().int().min(0),
  /** Sum of `hours` across games that provided a number. */
  totalHours: z.number().min(0),
  /** How many games contributed to totalHours (the rest had no `hours`). */
  gamesWithHours: z.number().int().min(0),
  /** Average hours over the games that provided one (null if none did). */
  averageHours: z.number().min(0).nullable(),
  /** Genre -> number of games tagged with it. Only genres that appear. */
  genreCounts: z.record(z.string(), z.number().int().min(1)),
  /** Genres sorted by descending count then alphabetical, top 3. */
  dominantGenres: z.array(z.string()),
  /** Player types the user selected (echoed, not derived). */
  playerTypes: z.array(z.string()),
});
export type ProfileStats = z.infer<typeof ProfileStatsSchema>;
