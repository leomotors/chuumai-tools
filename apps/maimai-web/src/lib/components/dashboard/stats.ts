import type {
  MaimaiMetric,
  StatsChartTransformed,
} from "$lib/components/StatsChart.svelte";
import type { UserStats } from "$lib/functions/userStats";

import { withMaxRating } from "@repo/core/web";

export type DashboardDelta = {
  text: string;
  positive: boolean;
};

export function transformUserStats(
  userStats: UserStats[] | undefined,
): StatsChartTransformed[] {
  if (!userStats || userStats.length === 0) return [];

  return withMaxRating(
    [...userStats]
      .sort(
        (a, b) =>
          new Date(a.lastPlayed).getTime() - new Date(b.lastPlayed).getTime(),
      )
      .map((stat) => ({
        date: new Date(stat.lastPlayed),
        playCount: stat.playCountTotal,
        rating: stat.rating,
        star: stat.star,
        isManual: false,
      })),
  );
}

export function filterStatsByRange<T extends { date: Date }>(
  records: T[],
  rangeDays: number,
): T[] {
  if (rangeDays <= 0) return records;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - rangeDays);
  return records.filter((record) => record.date >= cutoff);
}

export function lastPlayLabel(
  records: StatsChartTransformed[],
): string | undefined {
  if (records.length === 0) return undefined;
  const last = records[records.length - 1].date;
  const diffMs = Date.now() - last.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return last.toLocaleDateString();
}

export function deltaSinceDays(
  records: StatsChartTransformed[],
  days: number,
  getValue: (record: StatsChartTransformed) => number,
): DashboardDelta | null {
  if (records.length === 0) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const before = records.findLast((record) => record.date < cutoff);
  const baseline = before ? getValue(before) : getValue(records[0]);
  const current = getValue(records[records.length - 1]);
  const diff = current - baseline;
  if (diff === 0 && before) return null;
  const sign = diff >= 0 ? "+" : "";
  return { text: `${sign}${diff.toLocaleString()}`, positive: diff >= 0 };
}

export function playsDeltaWeek(
  records: StatsChartTransformed[],
): DashboardDelta | null {
  if (records.length === 0) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const before = records.findLast((record) => record.date < cutoff);
  const baseline = before ? before.playCount : records[0].playCount;
  const current = records[records.length - 1].playCount;
  const diff = current - baseline;
  return { text: `+${diff.toLocaleString()}`, positive: diff >= 0 };
}

export function sparklineValues(
  records: StatsChartTransformed[],
  metric: MaimaiMetric,
): number[] {
  const last30 = records.slice(-30);
  if (metric === "playCount") {
    return last30.map((record) => record.playCount);
  }
  return last30.map((record) => record[metric] as number);
}

export function activeDayCount(records: StatsChartTransformed[]): number {
  return new Set(
    records.map((record) =>
      new Date(
        record.date.getFullYear(),
        record.date.getMonth(),
        record.date.getDate(),
      ).getTime(),
    ),
  ).size;
}

export function longestActiveStreak(records: StatsChartTransformed[]): number {
  if (records.length === 0) return 0;
  const dayKeys = new Set(
    records.map((record) =>
      new Date(
        record.date.getFullYear(),
        record.date.getMonth(),
        record.date.getDate(),
      ).getTime(),
    ),
  );
  const sorted = [...dayKeys].sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const expected = new Date(
      prev.getFullYear(),
      prev.getMonth(),
      prev.getDate() + 1,
    ).getTime();
    if (sorted[i] === expected) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}
