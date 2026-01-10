import { and, desc, eq, lt } from "drizzle-orm";

import { db } from "$lib/db";

import { jobTable, playerDataTable } from "@repo/database/chuni";
import { z } from "@repo/types/zod";

/**
 * Schema for play count since response
 */
export const playCountSinceSchema = z
  .object({
    today: z.number().int().optional(),
    thisWeek: z.number().int().optional(),
    thisMonth: z.number().int().optional(),
    last30Days: z.number().int().optional(),
    last365Days: z.number().int().optional(),
  })
  .openapi("PlayCountSince");

export type PlayCountSince = z.infer<typeof playCountSinceSchema>;

/**
 * Get the cutoff time (7AM JST) for a given date.
 * @param date The base date to calculate from
 * @returns Date object set to 7AM JST on that day
 */
function getCutoffTime(date: Date): Date {
  // JST is UTC+9
  const cutoff = new Date(date);
  // Set to 7AM JST which is 22:00 UTC of the previous day
  cutoff.setUTCHours(22, 0, 0, 0);
  return cutoff;
}

/**
 * Get the start of the week (Monday at 7AM JST)
 * @param now Current time
 * @returns Date object for Monday 7AM JST of the current week
 */
function getWeekStart(now: Date): Date {
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Calculate days back to Monday

  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);

  return getCutoffTime(monday);
}

/**
 * Get the start of the month (1st day at 7AM JST)
 * @param now Current time
 * @returns Date object for the 1st day of current month at 7AM JST
 */
function getMonthStart(now: Date): Date {
  const firstDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return getCutoffTime(firstDay);
}

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
  const now = new Date();

  // Calculate cutoff times (7AM JST = 22:00 UTC previous day)
  const todayCutoff = getCutoffTime(now);
  const weekCutoff = getWeekStart(now);
  const monthCutoff = getMonthStart(now);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const thirtyDaysCutoff = getCutoffTime(thirtyDaysAgo);

  const oneYearAgo = new Date(now);
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
  const oneYearCutoff = getCutoffTime(oneYearAgo);

  // If current play count is not provided, get it from the latest record
  let currentCount = currentPlayCount;
  if (currentCount === undefined) {
    const latestRecord = await db
      .select({
        playCount: playerDataTable.playCount,
      })
      .from(jobTable)
      .innerJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
      .where(eq(jobTable.userId, userId))
      .orderBy(desc(playerDataTable.lastPlayed))
      .limit(1);

    if (latestRecord.length === 0) {
      // No records found, return all zeros
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        last30Days: 0,
        last365Days: 0,
      };
    }

    currentCount = latestRecord[0].playCount;
  }

  // Helper function to get play count at a specific cutoff time
  async function getPlayCountAtCutoff(
    cutoff: Date,
  ): Promise<number | undefined> {
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
  }

  // Get play counts at each cutoff time in parallel
  const [
    todayPlayCount,
    weekPlayCount,
    monthPlayCount,
    thirtyDaysPlayCount,
    oneYearPlayCount,
  ] = await Promise.all([
    getPlayCountAtCutoff(todayCutoff),
    getPlayCountAtCutoff(weekCutoff),
    getPlayCountAtCutoff(monthCutoff),
    getPlayCountAtCutoff(thirtyDaysCutoff),
    getPlayCountAtCutoff(oneYearCutoff),
  ]);

  return {
    today:
      todayPlayCount !== undefined ? currentCount - todayPlayCount : undefined,
    thisWeek:
      weekPlayCount !== undefined ? currentCount - weekPlayCount : undefined,
    thisMonth:
      monthPlayCount !== undefined ? currentCount - monthPlayCount : undefined,
    last30Days:
      thirtyDaysPlayCount !== undefined
        ? currentCount - thirtyDaysPlayCount
        : undefined,
    last365Days:
      oneYearPlayCount !== undefined
        ? currentCount - oneYearPlayCount
        : undefined,
  };
}
