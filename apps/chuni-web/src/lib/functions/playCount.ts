import { and, desc, eq, lt } from "drizzle-orm";

import { db } from "$lib/db";

import {
  calculatePlayCountSince,
  type PlayCountSince,
  playCountSinceSchema,
} from "@repo/core/web";
import { jobTable, playerDataTable } from "@repo/database/chuni";

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
      playCount: playerDataTable.playCount,
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

  const { playCount, playCountCurrent } = latestRecord[0];
  const currentCount = currentPlayCount ?? playCount;
  const thisVersion =
    playCountCurrent === null
      ? undefined
      : currentPlayCount !== undefined
        ? playCountCurrent + (currentPlayCount - playCount)
        : playCountCurrent;

  return calculatePlayCountSince(
    currentCount,
    async (cutoff) => {
      const record = await db
        .select({
          playCount: playerDataTable.playCount,
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

      return record.length > 0 ? record[0].playCount : undefined;
    },
    { thisVersion },
  );
}
