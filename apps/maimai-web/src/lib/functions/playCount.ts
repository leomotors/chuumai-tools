import { and, desc, eq, lt } from "drizzle-orm";

import { db } from "$lib/db";

import {
  calculatePlayCountSince,
  type PlayCountSince,
  playCountSinceSchema,
} from "@repo/core/web";
import { jobTable, playerDataTable } from "@repo/database/maimai";

export { type PlayCountSince, playCountSinceSchema };

/**
 * Get play count since various time periods with 7AM JST cutoff.
 *
 * @param userId User ID to query
 * @param currentPlayCount Optional current play count. If provided, this will be used
 *                          instead of querying the latest row from database.
 * @returns Object containing play counts for different time periods
 */
export async function getPlayCountSince(
  userId: string,
  currentPlayCount?: number,
): Promise<PlayCountSince> {
  const latestRecord = await db
    .select({
      playCountTotal: playerDataTable.playCountTotal,
      playCountCurrent: playerDataTable.playCountCurrent,
    })
    .from(jobTable)
    .innerJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(playerDataTable.lastPlayed))
    .limit(1);

  if (latestRecord.length === 0) {
    return {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      last30Days: 0,
      last365Days: 0,
      thisVersion: 0,
    };
  }

  const { playCountTotal, playCountCurrent } = latestRecord[0];
  const currentCount = currentPlayCount ?? playCountTotal;
  const thisVersion =
    currentPlayCount !== undefined
      ? playCountCurrent + (currentPlayCount - playCountTotal)
      : playCountCurrent;

  return calculatePlayCountSince(
    currentCount,
    async (cutoff) => {
      const record = await db
        .select({
          playCountTotal: playerDataTable.playCountTotal,
        })
        .from(jobTable)
        .innerJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
        .where(
          and(
            eq(jobTable.userId, userId),
            lt(playerDataTable.lastPlayed, cutoff),
          ),
        )
        .orderBy(desc(playerDataTable.lastPlayed))
        .limit(1);

      return record.length > 0 ? record[0].playCountTotal : undefined;
    },
    { thisVersion },
  );
}
