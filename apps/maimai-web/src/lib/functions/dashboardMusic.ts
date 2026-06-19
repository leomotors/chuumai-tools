import { and, asc, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "$lib/db";
import { getForRating } from "$lib/functions/forRating";

import { calculateRating } from "@repo/core/maimai";
import {
  forRatingTable,
  jobTable,
  musicDataTable,
  musicLevelTable,
  musicRecordTable,
  playerDataTable,
  playHistoryTable,
} from "@repo/database/maimai";
import type {
  AllChartDifficulty,
  ChartForRender,
  ChartTypeWithUtage,
  RatingType,
} from "@repo/types/maimai";

type RatingSource = "rating" | "selection" | "total";
type ApiRating = NonNullable<Awaited<ReturnType<typeof getForRating>>>;
type ApiRatingChart = ApiRating["best"][number];

const recordPlayerDataTable = alias(playerDataTable, "record_player_data");

export type DashboardMaimaiChart = ChartForRender & {
  order: number;
  source: RatingSource;
  achievedAt: Date | null;
};

export type DashboardMaimaiHistoryChart = Omit<
  DashboardMaimaiChart,
  "achievedAt" | "chartType" | "difficulty" | "order" | "source"
> & {
  chartType: ChartTypeWithUtage;
  difficulty: AllChartDifficulty;
  trackNo: number;
  playedAt: Date;
};

export type DashboardMaimaiMusic = {
  jobId: number;
  version: string;
  best: DashboardMaimaiChart[];
  current: DashboardMaimaiChart[];
  selectionBest: DashboardMaimaiChart[];
  selectionCurrent: DashboardMaimaiChart[];
  total: DashboardMaimaiChart[];
};

function buildChart(
  row: {
    title: string;
    chartType: DashboardMaimaiChart["chartType"];
    difficulty: DashboardMaimaiChart["difficulty"];
    level: string;
    constant: string | null;
    score: number;
    dxScore: number;
    dxScoreMax: number;
    comboMark: DashboardMaimaiChart["comboMark"];
    syncMark: DashboardMaimaiChart["syncMark"];
    image: string | null;
    achievedAt: Date | null;
    achievedJobId: number | null;
  },
  order: number,
  source: RatingSource,
  firstTrackedJobId: number | null,
): DashboardMaimaiChart {
  const constantValue = row.constant
    ? Number(row.constant)
    : parseFloat(row.level);
  const comboMark = row.comboMark ?? "NONE";

  return {
    title: row.title,
    chartType: row.chartType,
    difficulty: row.difficulty,
    score: row.score,
    dxScore: row.dxScore,
    dxScoreMax: row.dxScoreMax,
    comboMark,
    syncMark: row.syncMark ?? "NONE",
    level: constantValue,
    levelSure: row.constant !== null,
    rating: calculateRating(row.score, constantValue, comboMark),
    image: row.image,
    order,
    source,
    achievedAt:
      row.achievedJobId !== null && row.achievedJobId !== firstTrackedJobId
        ? row.achievedAt
        : null,
  };
}

async function getFirstTrackedJob(userId: string) {
  const result = await db
    .select({ jobId: jobTable.id })
    .from(playerDataTable)
    .innerJoin(jobTable, eq(playerDataTable.jobId, jobTable.id))
    .where(eq(jobTable.userId, userId))
    .orderBy(asc(jobTable.id))
    .limit(1);

  return result[0]?.jobId ?? null;
}

function chartKey(chart: {
  chartType: string;
  comboMark?: string | null;
  difficulty: string;
  dxScore?: number | null;
  dxScoreMax?: number | null;
  score: number;
  syncMark?: string | null;
  title: string;
}) {
  return [
    chart.title,
    chart.chartType,
    chart.difficulty,
    chart.score,
    chart.dxScore ?? 0,
    chart.dxScoreMax ?? 0,
    chart.comboMark ?? "NONE",
    chart.syncMark ?? "NONE",
  ].join("\u0000");
}

function toDashboardRatingChart(
  chart: ApiRatingChart,
  order: number,
  achievedAt: Date | null,
): DashboardMaimaiChart {
  return {
    ...chart,
    order,
    source: "rating",
    achievedAt,
  };
}

function selectBestChart(
  current: DashboardMaimaiChart | undefined,
  next: DashboardMaimaiChart,
) {
  if (!current) return next;
  if ((next.rating ?? -1) > (current.rating ?? -1)) return next;
  if (next.rating === current.rating && next.score > current.score) return next;
  return current;
}

export async function getDashboardMusic(
  userId: string,
): Promise<DashboardMaimaiMusic | null> {
  const forRating = await getForRating(userId);

  if (!forRating) return null;

  const { jobId, version } = forRating;
  const firstTrackedJobId = await getFirstTrackedJob(userId);

  const ratingRows = await db
    .select({
      ratingType: forRatingTable.ratingType,
      order: forRatingTable.order,
      title: musicDataTable.title,
      chartType: musicRecordTable.chartType,
      difficulty: musicRecordTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: musicRecordTable.score,
      dxScore: musicRecordTable.dxScore,
      dxScoreMax: musicRecordTable.dxScoreMax,
      comboMark: musicRecordTable.comboMark,
      syncMark: musicRecordTable.syncMark,
      image: musicDataTable.image,
      achievedAt: recordPlayerDataTable.lastPlayed,
      achievedJobId: recordPlayerDataTable.jobId,
    })
    .from(forRatingTable)
    .innerJoin(
      musicRecordTable,
      eq(forRatingTable.recordId, musicRecordTable.id),
    )
    .leftJoin(
      recordPlayerDataTable,
      eq(musicRecordTable.jobId, recordPlayerDataTable.jobId),
    )
    .innerJoin(
      musicDataTable,
      eq(musicRecordTable.musicTitle, musicDataTable.title),
    )
    .innerJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.title, musicLevelTable.musicTitle),
        eq(musicRecordTable.chartType, musicLevelTable.chartType),
        eq(musicRecordTable.difficulty, musicLevelTable.difficulty),
        eq(forRatingTable.version, musicLevelTable.version),
      ),
    )
    .where(eq(forRatingTable.jobId, jobId));

  const byType = new Map<RatingType, DashboardMaimaiChart[]>();

  for (const row of ratingRows) {
    const source = row.ratingType.startsWith("SELECTION_")
      ? "selection"
      : "rating";
    const chart = buildChart(row, row.order, source, firstTrackedJobId);
    const list = byType.get(row.ratingType) ?? [];
    list.push(chart);
    byType.set(row.ratingType, list);
  }

  for (const list of byType.values()) {
    list.sort((a, b) => a.order - b.order);
  }

  const achievedAtByChart = new Map(
    [...byType.values()]
      .flat()
      .map((chart) => [chartKey(chart), chart.achievedAt] as const),
  );

  const totalRows = await db
    .select({
      title: musicDataTable.title,
      chartType: musicRecordTable.chartType,
      difficulty: musicRecordTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: musicRecordTable.score,
      dxScore: musicRecordTable.dxScore,
      dxScoreMax: musicRecordTable.dxScoreMax,
      comboMark: musicRecordTable.comboMark,
      syncMark: musicRecordTable.syncMark,
      image: musicDataTable.image,
      achievedAt: recordPlayerDataTable.lastPlayed,
      achievedJobId: recordPlayerDataTable.jobId,
    })
    .from(musicRecordTable)
    .innerJoin(jobTable, eq(musicRecordTable.jobId, jobTable.id))
    .leftJoin(
      recordPlayerDataTable,
      eq(musicRecordTable.jobId, recordPlayerDataTable.jobId),
    )
    .innerJoin(
      musicDataTable,
      eq(musicRecordTable.musicTitle, musicDataTable.title),
    )
    .innerJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.title, musicLevelTable.musicTitle),
        eq(musicRecordTable.chartType, musicLevelTable.chartType),
        eq(musicRecordTable.difficulty, musicLevelTable.difficulty),
        eq(musicLevelTable.version, version),
      ),
    )
    .where(eq(jobTable.userId, userId));

  const totalByChart = new Map<string, DashboardMaimaiChart>();

  for (const row of totalRows) {
    if (row.score <= 0) continue;

    const key = `${row.title}-${row.chartType}-${row.difficulty}`;
    const chart = buildChart(row, 0, "total", firstTrackedJobId);
    totalByChart.set(key, selectBestChart(totalByChart.get(key), chart));
  }

  return {
    jobId,
    version,
    best: forRating.best.map((chart, index) =>
      toDashboardRatingChart(
        chart,
        index + 1,
        achievedAtByChart.get(chartKey(chart)) ?? null,
      ),
    ),
    current: forRating.current.map((chart, index) =>
      toDashboardRatingChart(
        chart,
        index + 1,
        achievedAtByChart.get(chartKey(chart)) ?? null,
      ),
    ),
    selectionBest: byType.get("SELECTION_OLD") ?? [],
    selectionCurrent: byType.get("SELECTION_NEW") ?? [],
    total: [...totalByChart.values()],
  };
}

export async function getDashboardPlayHistory(
  userId: string,
  limit: number,
): Promise<DashboardMaimaiHistoryChart[]> {
  const latestMusic = await getDashboardMusic(userId);
  const version = latestMusic?.version;

  if (!version) return [];

  const rows = await db
    .select({
      title: playHistoryTable.musicTitle,
      chartType: playHistoryTable.chartType,
      difficulty: playHistoryTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: playHistoryTable.score,
      dxScore: playHistoryTable.dxScore,
      dxScoreMax: playHistoryTable.dxScoreMax,
      comboMark: playHistoryTable.comboMark,
      syncMark: playHistoryTable.syncMark,
      image: musicDataTable.image,
      trackNo: playHistoryTable.trackNo,
      playedAt: playHistoryTable.playedAt,
    })
    .from(playHistoryTable)
    .innerJoin(jobTable, eq(playHistoryTable.jobId, jobTable.id))
    .innerJoin(
      musicDataTable,
      eq(playHistoryTable.musicTitle, musicDataTable.title),
    )
    .leftJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.title, musicLevelTable.musicTitle),
        // History has wider enum types for UTAGE rows; level data only has std/dx
        // standard difficulties, so compare overlapping enum labels as text.
        sql`${playHistoryTable.chartType}::text = ${musicLevelTable.chartType}::text`,
        sql`${playHistoryTable.difficulty}::text = ${musicLevelTable.difficulty}::text`,
        eq(musicLevelTable.version, version),
      ),
    )
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(playHistoryTable.playedAt), desc(playHistoryTable.trackNo))
    .limit(limit);

  return rows.map((row) => {
    const constantValue = row.level
      ? row.constant
        ? Number(row.constant)
        : parseFloat(row.level)
      : 0;
    const hasRating = row.level !== null;

    return {
      title: row.title,
      chartType: row.chartType,
      difficulty: row.difficulty,
      score: row.score,
      dxScore: row.dxScore,
      dxScoreMax: row.dxScoreMax,
      comboMark: row.comboMark,
      syncMark: row.syncMark,
      level: constantValue,
      levelSure: row.constant !== null,
      rating: hasRating
        ? calculateRating(row.score, constantValue, row.comboMark)
        : null,
      image: row.image,
      trackNo: row.trackNo,
      playedAt: row.playedAt,
    };
  });
}
