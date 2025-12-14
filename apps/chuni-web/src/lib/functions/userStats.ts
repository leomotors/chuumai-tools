import { desc, eq } from "drizzle-orm";

import { db } from "$lib/db";

import { jobTable, playerDataTable } from "@repo/database/chuni";
import { z } from "@repo/types/zod";

/**
 * Schema for user stats response
 */
export const userStatsSchema = z
  .object({
    lastPlayed: z.coerce.date(),
    jobId: z.number(),
    playerLevel: z.number(),
    playCount: z.number(),
    rating: z.string(),
    overpowerValue: z.string(),
  })
  .openapi("UserStats");

export type UserStats = z.infer<typeof userStatsSchema>;

/**
 * Get user stats history - returns player data at each distinct play session.
 *
 * SQL equivalent:
 * ```sql
 * SELECT DISTINCT ON (last_played)
 *   last_played, job.id, player_level, play_count, rating, overpower_value
 * FROM job
 * INNER JOIN player_data ON user_id = {USER ID} AND job.id = player_data.job_id
 * ```
 */
export async function getUserStats(userId: string): Promise<UserStats[]> {
  // Using selectDistinctOn for DISTINCT ON (last_played)
  // Note: When using DISTINCT ON, order by must start with the distinct columns
  const result = await db
    .selectDistinctOn([playerDataTable.lastPlayed], {
      lastPlayed: playerDataTable.lastPlayed,
      jobId: jobTable.id,
      playerLevel: playerDataTable.playerLevel,
      playCount: playerDataTable.playCount,
      rating: playerDataTable.rating,
      overpowerValue: playerDataTable.overpowerValue,
    })
    .from(jobTable)
    .innerJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(playerDataTable.lastPlayed));

  return result.map((row) => ({
    lastPlayed: row.lastPlayed,
    jobId: row.jobId,
    playerLevel: row.playerLevel,
    playCount: row.playCount,
    rating: row.rating,
    overpowerValue: row.overpowerValue,
  }));
}
