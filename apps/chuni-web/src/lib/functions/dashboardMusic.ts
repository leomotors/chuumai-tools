import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "$lib/db";

import { calculateRating, constantFromLevel } from "@repo/core/chuni";
import {
  forRatingTable,
  jobTable,
  musicDataTable,
  musicLevelTable,
  musicRecordTable,
  playerDataTable,
  playHistoryTable,
} from "@repo/database/chuni";
import type { ChartForRender, RatingType } from "@repo/types/chuni";

type RatingSource = "rating" | "selection" | "total";

const recordPlayerDataTable = alias(playerDataTable, "record_player_data");

export type DashboardChuniChart = ChartForRender & {
  fullChain: number;
  order: number;
  source: RatingSource;
  achievedAt: Date | null;
};

export type DashboardChuniHistoryChart = Omit<
  DashboardChuniChart,
  "achievedAt" | "difficulty" | "order" | "source"
> & {
  difficulty: DashboardChuniChart["difficulty"] | null;
  trackNo: number;
  playedAt: Date;
};

export type DashboardChuniMusic = {
  jobId: number;
  version: string;
  best: DashboardChuniChart[];
  current: DashboardChuniChart[];
  selectionBest: DashboardChuniChart[];
  selectionCurrent: DashboardChuniChart[];
  total: DashboardChuniChart[];
};

async function getLatestJob(userId: string) {
  const result = await db
    .select({ jobId: jobTable.id })
    .from(playerDataTable)
    .innerJoin(jobTable, eq(playerDataTable.jobId, jobTable.id))
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(jobTable.id))
    .limit(1);

  return result[0]?.jobId ?? null;
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

function buildChart(
  row: {
    musicId: number;
    title: string;
    difficulty: DashboardChuniChart["difficulty"];
    level: string;
    constant: string | null;
    score: number;
    clearMark: DashboardChuniChart["clearMark"];
    fc: boolean;
    aj: boolean;
    fullChain: number;
    image: string | null;
    achievedAt: Date | null;
    achievedJobId: number | null;
  },
  order: number,
  source: RatingSource,
  firstTrackedJobId: number | null,
): DashboardChuniChart {
  const constantValue = row.constant
    ? Number(row.constant)
    : constantFromLevel(row.level);

  return {
    id: row.musicId,
    title: row.title,
    difficulty: row.difficulty,
    score: row.score,
    clearMark: row.clearMark,
    fc: row.fc,
    aj: row.aj,
    fullChain: row.fullChain,
    isHidden: false,
    constant: constantValue,
    constantSure: row.constant !== null,
    rating: calculateRating(row.score, constantValue),
    image: row.image,
    order,
    source,
    achievedAt:
      row.achievedJobId !== null && row.achievedJobId !== firstTrackedJobId
        ? row.achievedAt
        : null,
  };
}

function selectBestChart(
  current: DashboardChuniChart | undefined,
  next: DashboardChuniChart,
) {
  if (!current) return next;
  if ((next.rating ?? -1) > (current.rating ?? -1)) return next;
  if (next.rating === current.rating && next.score > current.score) return next;
  return current;
}

export async function getDashboardMusic(
  userId: string,
): Promise<DashboardChuniMusic | null> {
  const jobId = await getLatestJob(userId);

  if (!jobId) return null;

  const firstTrackedJobId = await getFirstTrackedJob(userId);

  const versionRow = await db
    .select({ version: forRatingTable.version })
    .from(forRatingTable)
    .where(eq(forRatingTable.jobId, jobId))
    .limit(1);
  const version = versionRow[0]?.version;

  if (!version) return null;

  const ratingRows = await db
    .select({
      ratingType: forRatingTable.ratingType,
      order: forRatingTable.order,
      musicId: musicDataTable.id,
      title: musicDataTable.title,
      difficulty: musicRecordTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: musicRecordTable.score,
      clearMark: musicRecordTable.clearMark,
      fc: musicRecordTable.fc,
      aj: musicRecordTable.aj,
      fullChain: musicRecordTable.fullChain,
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
    .innerJoin(musicDataTable, eq(musicRecordTable.musicId, musicDataTable.id))
    .innerJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.id, musicLevelTable.musicId),
        eq(musicRecordTable.difficulty, musicLevelTable.difficulty),
        eq(forRatingTable.version, musicLevelTable.version),
      ),
    )
    .where(eq(forRatingTable.jobId, jobId));

  const byType = new Map<RatingType, DashboardChuniChart[]>();

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

  const totalRows = await db
    .select({
      musicId: musicDataTable.id,
      title: musicDataTable.title,
      difficulty: musicRecordTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: musicRecordTable.score,
      clearMark: musicRecordTable.clearMark,
      fc: musicRecordTable.fc,
      aj: musicRecordTable.aj,
      fullChain: musicRecordTable.fullChain,
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
    .innerJoin(musicDataTable, eq(musicRecordTable.musicId, musicDataTable.id))
    .innerJoin(
      musicLevelTable,
      and(
        eq(musicDataTable.id, musicLevelTable.musicId),
        eq(musicRecordTable.difficulty, musicLevelTable.difficulty),
        eq(musicLevelTable.version, version),
      ),
    )
    .where(eq(jobTable.userId, userId));

  const totalByChart = new Map<string, DashboardChuniChart>();

  for (const row of totalRows) {
    if (row.score <= 0) continue;

    const key = `${row.musicId}-${row.difficulty}`;
    const chart = buildChart(row, 0, "total", firstTrackedJobId);
    totalByChart.set(key, selectBestChart(totalByChart.get(key), chart));
  }

  return {
    jobId,
    version,
    best: byType.get("BEST") ?? [],
    current: byType.get("CURRENT") ?? [],
    selectionBest: byType.get("SELECTION_BEST") ?? [],
    selectionCurrent: byType.get("SELECTION_CURRENT") ?? [],
    total: [...totalByChart.values()],
  };
}

export async function getDashboardPlayHistory(
  userId: string,
): Promise<DashboardChuniHistoryChart[]> {
  const latestMusic = await getDashboardMusic(userId);
  const version = latestMusic?.version;

  if (!version) return [];

  const rows = await db
    .select({
      musicId: musicDataTable.id,
      title: playHistoryTable.musicTitle,
      difficulty: playHistoryTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: playHistoryTable.score,
      clearMark: playHistoryTable.clearMark,
      fc: playHistoryTable.fc,
      aj: playHistoryTable.aj,
      fullChain: playHistoryTable.fullChain,
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
        eq(musicDataTable.id, musicLevelTable.musicId),
        eq(playHistoryTable.difficulty, musicLevelTable.difficulty),
        eq(musicLevelTable.version, version),
      ),
    )
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(playHistoryTable.playedAt), desc(playHistoryTable.trackNo))
    .limit(200);

  return rows.map((row) => {
    const constantValue =
      row.level && row.difficulty
        ? row.constant
          ? Number(row.constant)
          : constantFromLevel(row.level)
        : 0;

    return {
      id: row.musicId,
      title: row.title,
      difficulty: row.difficulty,
      score: row.score,
      clearMark: row.clearMark,
      fc: row.fc,
      aj: row.aj,
      fullChain: row.fullChain,
      isHidden: false,
      constant: constantValue,
      constantSure: row.constant !== null,
      rating: row.difficulty ? calculateRating(row.score, constantValue) : null,
      image: row.image,
      trackNo: row.trackNo,
      playedAt: row.playedAt,
    };
  });
}
