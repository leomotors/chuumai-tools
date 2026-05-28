import { and, desc, eq } from "drizzle-orm";

import { db } from "$lib/db";
import { getMusicInfo } from "$lib/functions/musicRecord";

import { jobTable, playHistoryTable } from "@repo/database/maimai";
import {
  allChartDifficultyValues,
  chartTypeWithUtageValues,
  comboMarkValues,
  syncMarkValues,
} from "@repo/types/maimai";
import { z } from "@repo/types/zod";

const playHistoryItemSchema = z
  .object({
    chartType: z.enum(chartTypeWithUtageValues),
    difficulty: z.enum(allChartDifficultyValues),
    score: z.number(),
    dxScore: z.number(),
    dxScoreMax: z.number(),
    comboMark: z.enum(comboMarkValues),
    syncMark: z.enum(syncMarkValues),
    trackNo: z.number(),
    playedAt: z.coerce.date(),
  })
  .openapi("PlayHistoryItem");

export const playHistorySchema = z
  .object({
    earliestPlayedAt: z.coerce.date().nullable(),
    playCounts: z.record(z.string(), z.number()),
    records: z.array(playHistoryItemSchema),
  })
  .openapi("PlayHistory");

export type PlayHistory = z.infer<typeof playHistorySchema>;

export async function getPlayHistory(
  userId: string,
  musicTitle: string,
): Promise<PlayHistory> {
  await getMusicInfo(musicTitle);

  const records = await db
    .select({
      chartType: playHistoryTable.chartType,
      difficulty: playHistoryTable.difficulty,
      score: playHistoryTable.score,
      dxScore: playHistoryTable.dxScore,
      dxScoreMax: playHistoryTable.dxScoreMax,
      comboMark: playHistoryTable.comboMark,
      syncMark: playHistoryTable.syncMark,
      trackNo: playHistoryTable.trackNo,
      playedAt: playHistoryTable.playedAt,
    })
    .from(playHistoryTable)
    .innerJoin(jobTable, eq(playHistoryTable.jobId, jobTable.id))
    .where(
      and(
        eq(jobTable.userId, userId),
        eq(playHistoryTable.musicTitle, musicTitle),
      ),
    )
    .orderBy(desc(playHistoryTable.playedAt), desc(playHistoryTable.trackNo));

  const playCounts: Record<string, number> = {};

  for (const record of records) {
    const key = `${record.chartType}-${record.difficulty}`;
    playCounts[key] = (playCounts[key] ?? 0) + 1;
  }

  const earliestPlayedAt =
    records.length === 0 ? null : (records.at(-1)?.playedAt ?? null);

  return {
    earliestPlayedAt,
    playCounts,
    records,
  };
}
