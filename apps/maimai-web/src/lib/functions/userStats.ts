import { desc, eq } from "drizzle-orm";

import { db } from "$lib/db";

import { jobTable, playerDataTable } from "@repo/database/maimai";
import { z } from "@repo/types/zod";

/**
 * Schema for user stats response
 */
export const userStatsSchema = z
  .object({
    lastPlayed: z.coerce.date(),
    jobId: z.number(),
    playCountCurrent: z.number(),
    playCountTotal: z.number(),
    rating: z.number(),
    star: z.number(),
  })
  .openapi("UserStats");

export type UserStats = z.infer<typeof userStatsSchema>;

/**
 * Get user stats history - returns player data at each distinct play session.
 *
 * SQL equivalent:
 * ```sql
 * SELECT DISTINCT ON (last_played)
 *   last_played, job.id, play_count_current, play_count_total, rating, star
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
      playCountCurrent: playerDataTable.playCountCurrent,
      playCountTotal: playerDataTable.playCountTotal,
      rating: playerDataTable.rating,
      star: playerDataTable.star,
    })
    .from(jobTable)
    .innerJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(playerDataTable.lastPlayed));

  return result.map((row) => ({
    lastPlayed: row.lastPlayed,
    jobId: row.jobId,
    playCountCurrent: row.playCountCurrent,
    playCountTotal: row.playCountTotal,
    rating: row.rating,
    star: row.star,
  }));
}
