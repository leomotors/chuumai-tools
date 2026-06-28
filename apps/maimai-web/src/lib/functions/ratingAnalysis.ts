import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "$lib/db";

import { calculateRating } from "@repo/core/maimai";
import {
  buildRatingAnalysis,
  type RatingAnalysisHistoryInput,
  type RatingAnalysisPayload,
  ratingAnalysisPayloadIsCurrent,
  type RatingAnalysisSnapshotInput,
  sanitizeJsonbValue,
} from "@repo/core/web";
import {
  forRatingTable,
  jobTable,
  musicDataTable,
  musicLevelTable,
  musicRecordTable,
  playerDataTable,
  playHistoryTable,
  ratingAnalysisCacheTable,
} from "@repo/database/maimai";

type RatingAnalysisCacheRow = {
  latestJobId: number;
  payload: unknown;
};

function chartKey(row: {
  title: string;
  chartType: string;
  difficulty: string;
}) {
  return `${row.title}:${row.chartType}:${row.difficulty}`;
}

function chartLabel(row: { chartType: string; difficulty: string }) {
  return `${row.chartType} ${row.difficulty}`;
}

function levelLabel(row: { constant: unknown; level: string }) {
  const constant = row.constant ? Number(row.constant) : parseFloat(row.level);
  return constant > 0 ? constant.toFixed(1) : row.level;
}

async function getLatestRatingJobId(userId: string) {
  const rows = await db
    .select({ jobId: jobTable.id })
    .from(playerDataTable)
    .innerJoin(jobTable, eq(playerDataTable.jobId, jobTable.id))
    .where(eq(jobTable.userId, userId))
    .orderBy(asc(playerDataTable.lastPlayed), asc(jobTable.id));

  return rows.at(-1)?.jobId ?? null;
}

async function getCachedAnalysis(userId: string) {
  try {
    const rows = await db
      .select({
        latestJobId: ratingAnalysisCacheTable.latestJobId,
        payload: ratingAnalysisCacheTable.payload,
      })
      .from(ratingAnalysisCacheTable)
      .where(eq(ratingAnalysisCacheTable.userId, userId))
      .limit(1);

    return rows[0] as RatingAnalysisCacheRow | undefined;
  } catch (err) {
    console.error("Error reading rating analysis cache:", err);
    return undefined;
  }
}

async function saveRatingAnalysisCache(
  userId: string,
  analysis: RatingAnalysisPayload,
) {
  if (analysis.latestJobId === null) return;

  try {
    await db
      .insert(ratingAnalysisCacheTable)
      .values({
        userId,
        latestJobId: analysis.latestJobId,
        computedAt: new Date(analysis.computedAt),
        payload: sanitizeJsonbValue(analysis),
      })
      .onConflictDoUpdate({
        target: ratingAnalysisCacheTable.userId,
        set: {
          latestJobId: analysis.latestJobId,
          computedAt: new Date(analysis.computedAt),
          payload: sanitizeJsonbValue(analysis),
        },
      });
  } catch (err) {
    console.error("Error saving rating analysis cache:", err);
  }
}

async function loadSnapshots(
  userId: string,
): Promise<RatingAnalysisSnapshotInput[]> {
  const snapshotRows = await db
    .select({
      jobId: jobTable.id,
      playedAt: playerDataTable.lastPlayed,
      rating: playerDataTable.rating,
      playCount: playerDataTable.playCountTotal,
    })
    .from(playerDataTable)
    .innerJoin(jobTable, eq(playerDataTable.jobId, jobTable.id))
    .where(eq(jobTable.userId, userId))
    .orderBy(asc(playerDataTable.lastPlayed), asc(jobTable.id));

  const ratingRows = await db
    .select({
      jobId: forRatingTable.jobId,
      title: musicDataTable.title,
      image: musicDataTable.image,
      chartType: musicRecordTable.chartType,
      difficulty: musicRecordTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: musicRecordTable.score,
      comboMark: musicRecordTable.comboMark,
      ratingType: forRatingTable.ratingType,
      order: forRatingTable.order,
    })
    .from(forRatingTable)
    .innerJoin(jobTable, eq(forRatingTable.jobId, jobTable.id))
    .innerJoin(
      musicRecordTable,
      eq(forRatingTable.recordId, musicRecordTable.id),
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
    .where(eq(jobTable.userId, userId));

  const recordsByJobId = new Map<
    number,
    RatingAnalysisSnapshotInput["records"]
  >();

  for (const row of ratingRows) {
    if (row.ratingType !== "OLD" && row.ratingType !== "NEW") continue;

    const constant = row.constant
      ? Number(row.constant)
      : parseFloat(row.level);
    const records = recordsByJobId.get(row.jobId ?? 0) ?? [];
    records.push({
      chartKey: chartKey(row),
      songKey: row.title,
      title: row.title,
      image: row.image,
      difficulty: row.difficulty,
      level: levelLabel(row),
      chartLabel: chartLabel(row),
      score: row.score,
      rating: calculateRating(row.score, constant, row.comboMark),
      slot: row.ratingType === "OLD" ? "old" : "new",
      order: row.order,
    });
    recordsByJobId.set(row.jobId ?? 0, records);
  }

  return snapshotRows.map((row) => ({
    jobId: row.jobId,
    playedAt: row.playedAt,
    rating: row.rating,
    playCount: row.playCount,
    overpower: null,
    records: recordsByJobId.get(row.jobId) ?? [],
  }));
}

async function loadHistories(
  userId: string,
): Promise<RatingAnalysisHistoryInput[]> {
  const rows = await db
    .select({
      title: playHistoryTable.musicTitle,
      chartType: playHistoryTable.chartType,
      difficulty: playHistoryTable.difficulty,
      score: playHistoryTable.score,
      playedAt: playHistoryTable.playedAt,
    })
    .from(playHistoryTable)
    .innerJoin(jobTable, eq(playHistoryTable.jobId, jobTable.id))
    .where(
      and(
        eq(jobTable.userId, userId),
        sql`${playHistoryTable.chartType}::text <> 'UTAGE'`,
      ),
    );

  return rows.map((row) => ({
    chartKey: chartKey(row),
    title: row.title,
    chartLabel: chartLabel(row),
    score: row.score,
    playedAt: row.playedAt,
  }));
}

export async function recomputeRatingAnalysis(
  userId: string,
): Promise<RatingAnalysisPayload> {
  const analysis = buildRatingAnalysis({
    snapshots: await loadSnapshots(userId),
    histories: await loadHistories(userId),
  });

  await saveRatingAnalysisCache(userId, analysis);

  return analysis;
}

export async function getRatingAnalysis(
  userId: string,
): Promise<RatingAnalysisPayload> {
  const latestJobId = await getLatestRatingJobId(userId);

  if (latestJobId !== null) {
    const cached = await getCachedAnalysis(userId);
    if (
      cached?.latestJobId === latestJobId &&
      ratingAnalysisPayloadIsCurrent(cached.payload)
    ) {
      return cached.payload as RatingAnalysisPayload;
    }
  }

  return recomputeRatingAnalysis(userId);
}
