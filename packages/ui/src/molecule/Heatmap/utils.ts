export type HeatmapDay = {
  date: Date;
  value: number;
  hasData: boolean;
  isReset?: boolean;
};

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

function dayRange(records: { date: Date }[]): {
  minDay: Date;
  totalDays: number;
} | null {
  if (records.length === 0) return null;
  const times = records.map((r) => startOfDay(r.date).getTime());
  const minDay = startOfDay(new Date(Math.min(...times)));
  const maxDay = startOfDay(new Date(Math.max(...times)));
  const totalDays =
    Math.round((maxDay.getTime() - minDay.getTime()) / 86_400_000) + 1;
  return { minDay, totalDays };
}

/**
 * Build heatmap days where each day's value is the count of records on that day.
 * Suitable for "frequency of plays" style metrics.
 */
export function buildCountHeatmap<T extends { date: Date }>(
  records: T[],
): HeatmapDay[] {
  const range = dayRange(records);
  if (!range) return [];

  const counts: Record<string, number> = {};
  for (const rec of records) {
    const key = dayKey(rec.date);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const days: HeatmapDay[] = [];
  for (let i = 0; i < range.totalDays; i++) {
    const d = addDays(range.minDay, i);
    const count = counts[dayKey(d)] ?? 0;
    days.push({ date: d, value: count, hasData: count > 0 });
  }
  return days;
}

/**
 * Build heatmap days where each day's value is the *gain* on that day —
 * the difference between the latest record on the day and the latest
 * record on the previous day with data. Days with no records have hasData=false.
 *
 * If `detectReset` is true, days with a negative gain are flagged via `isReset`
 * (e.g. for ratings that only decrease on version bumps).
 *
 * The first day with data has gain=0 (no prior baseline to compare against).
 */
export function buildGainHeatmap<T extends { date: Date }>(
  records: T[],
  getValue: (r: T) => number,
  options: { detectReset?: boolean } = {},
): HeatmapDay[] {
  const range = dayRange(records);
  if (!range) return [];

  const byDay: Record<string, T[]> = {};
  for (const rec of records) {
    const key = dayKey(rec.date);
    const list = byDay[key];
    if (list) list.push(rec);
    else byDay[key] = [rec];
  }

  const days: HeatmapDay[] = [];
  let prevValue: number | null = null;
  for (let i = 0; i < range.totalDays; i++) {
    const d = addDays(range.minDay, i);
    const dayRecs = byDay[dayKey(d)] ?? [];
    if (dayRecs.length === 0) {
      days.push({ date: d, value: 0, hasData: false });
      continue;
    }
    // Use the latest record on the day so version bumps (rating drops) are
    // captured rather than masked by an earlier-in-the-day max.
    const sorted = [...dayRecs].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const todayValue = getValue(sorted[sorted.length - 1]);
    const gain = prevValue === null ? 0 : todayValue - prevValue;
    const day: HeatmapDay = { date: d, value: gain, hasData: true };
    if (options.detectReset && gain < 0) day.isReset = true;
    days.push(day);
    prevValue = todayValue;
  }
  return days;
}
