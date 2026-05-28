import { and, desc, eq } from "drizzle-orm";

import { db } from "$lib/db";
import { getMusicInfo } from "$lib/functions/musicRecord";

import { jobTable, playHistoryTable } from "@repo/database/chuni";
import { clearMarkValues, stdChartDifficultyValues } from "@repo/types/chuni";
import { z } from "@repo/types/zod";

const playHistoryItemSchema = z
  .object({
    difficulty: z.enum(stdChartDifficultyValues).nullable(),
    score: z.number(),
    clearMark: z.enum(clearMarkValues).nullable(),
    fc: z.boolean(),
    aj: z.boolean(),
    fullChain: z.number(),
    trackNo: z.number(),
    playedAt: z.coerce.date(),
  })
  .openapi("PlayHistoryItem");

export const playHistorySchema = z
  .object({
    earliestPlayedAt: z.coerce.date().nullable(),
    playCounts: z.record(z.enum(stdChartDifficultyValues), z.number()),
    records: z.array(playHistoryItemSchema),
  })
  .openapi("PlayHistory");

export type PlayHistory = z.infer<typeof playHistorySchema>;

export async function getPlayHistory(
  userId: string,
  musicId: number,
): Promise<PlayHistory> {
  const musicInfo = await getMusicInfo(musicId);

  const records = await db
    .select({
      difficulty: playHistoryTable.difficulty,
      score: playHistoryTable.score,
      clearMark: playHistoryTable.clearMark,
      fc: playHistoryTable.fc,
      aj: playHistoryTable.aj,
      fullChain: playHistoryTable.fullChain,
      trackNo: playHistoryTable.trackNo,
      playedAt: playHistoryTable.playedAt,
    })
    .from(playHistoryTable)
    .innerJoin(jobTable, eq(playHistoryTable.jobId, jobTable.id))
    .where(
      and(
        eq(jobTable.userId, userId),
        eq(playHistoryTable.musicTitle, musicInfo.title),
      ),
    )
    .orderBy(desc(playHistoryTable.playedAt), desc(playHistoryTable.trackNo));

  const playCounts = Object.fromEntries(
    stdChartDifficultyValues.map((difficulty) => [difficulty, 0]),
  ) as Record<(typeof stdChartDifficultyValues)[number], number>;

  for (const record of records) {
    if (record.difficulty) {
      playCounts[record.difficulty] += 1;
    }
  }

  const earliestPlayedAt =
    records.length === 0 ? null : (records.at(-1)?.playedAt ?? null);

  return {
    earliestPlayedAt,
    playCounts,
    records,
  };
}
