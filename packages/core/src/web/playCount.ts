import { z } from "@repo/types/zod";

// ---------------------------------------------------------------------------
// Date utilities (7AM JST cutoff helpers)
// ---------------------------------------------------------------------------

/**
 * Get the cutoff time (7AM JST) for a given date.
 * 7AM JST = 22:00 UTC of the previous day.
 */
export function getCutoffTime(date: Date): Date {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - 1);
  cutoff.setUTCHours(22, 0, 0, 0);
  return cutoff;
}

/**
 * Get the start of the week (Monday at 7AM JST) for a given date.
 */
export function getWeekStart(now: Date): Date {
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);

  return getCutoffTime(monday);
}

/**
 * Get the start of the month (1st day at 7AM JST) for a given date.
 */
export function getMonthStart(now: Date): Date {
  const firstDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return getCutoffTime(firstDay);
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const playCountSinceSchema = z
  .object({
    today: z.number().int().optional(),
    thisWeek: z.number().int().optional(),
    thisMonth: z.number().int().optional(),
    last30Days: z.number().int().optional(),
    last365Days: z.number().int().optional(),
    thisVersion: z.number().int().optional(),
  })
  .openapi("PlayCountSince");

export type PlayCountSince = z.infer<typeof playCountSinceSchema>;

// ---------------------------------------------------------------------------
// Shared calculation logic
// ---------------------------------------------------------------------------

/**
 * Calculate play counts since various time periods with 7AM JST cutoff.
 *
 * @param currentCount The current total play count
 * @param getPlayCountAtCutoff Callback that queries the DB for the play count
 *   recorded before the given cutoff date. Returns `undefined` if no record
 *   exists before that date.
 * @param extra Additional game-specific fields to merge into the result
 *   (e.g. `{ thisVersion }` for maimai). Pass `{ thisVersion: undefined }` to
 *   include the field as absent while keeping the type compatible.
 */
export async function calculatePlayCountSince(
  currentCount: number,
  getPlayCountAtCutoff: (cutoff: Date) => Promise<number | undefined>,
  extra?: Partial<PlayCountSince>,
): Promise<PlayCountSince> {
  const now = new Date();

  const todayCutoff = getCutoffTime(now);
  const weekCutoff = getWeekStart(now);
  const monthCutoff = getMonthStart(now);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const thirtyDaysCutoff = getCutoffTime(thirtyDaysAgo);

  const oneYearAgo = new Date(now);
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
  const oneYearCutoff = getCutoffTime(oneYearAgo);

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
    ...extra,
  };
}
