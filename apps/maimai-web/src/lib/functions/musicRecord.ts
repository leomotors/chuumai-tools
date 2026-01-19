import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

import { db } from "$lib/db";

import {
  jobTable,
  musicDataTable,
  musicRecordTable,
  playerDataTable,
} from "@repo/database/maimai";
import {
  chartTypeValues,
  comboMarkValues,
  stdChartDifficultyValues,
  syncMarkValues,
} from "@repo/types/maimai";
import { z } from "@repo/types/zod";

const musicRecordItemSchema = z
  .object({
    chartType: z.enum(chartTypeValues),
    difficulty: z.enum(stdChartDifficultyValues),
    score: z.number(),
    dxScore: z.number(),
    dxScoreMax: z.number(),
    comboMark: z.enum(comboMarkValues),
    syncMark: z.enum(syncMarkValues),
    lastPlayed: z.coerce.date().nullable(),
  })
  .openapi("MusicRecordItem");

const musicInfoSchema = z
  .object({
    title: z.string(),
    category: z.string(),
    artist: z.string(),
    image: z.string(),
    version: z.number(),
  })
  .openapi("MusicInfo");

export const musicRecordSchema = z
  .object({
    musicInfo: musicInfoSchema,
    records: z.array(musicRecordItemSchema),
  })
  .openapi("MusicRecord");

export type MusicRecord = z.infer<typeof musicRecordSchema>;

export async function getMusicRecord(userId: string, musicTitle: string) {
  const musicInfo = (
    await db
      .select()
      .from(musicDataTable)
      .where(eq(musicDataTable.title, musicTitle))
  )[0];

  if (!musicInfo) {
    error(404, "Music not found");
  }

  const result = await db
    .select({
      chartType: musicRecordTable.chartType,
      difficulty: musicRecordTable.difficulty,
      score: musicRecordTable.score,
      dxScore: musicRecordTable.dxScore,
      dxScoreMax: musicRecordTable.dxScoreMax,
      comboMark: musicRecordTable.comboMark,
      syncMark: musicRecordTable.syncMark,
      lastPlayed: playerDataTable.lastPlayed,
    })
    .from(musicRecordTable)
    .innerJoin(jobTable, eq(musicRecordTable.jobId, jobTable.id))
    .leftJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
    .where(
      and(
        eq(jobTable.userId, userId),
        eq(musicRecordTable.musicTitle, musicTitle),
      ),
    );

  return {
    musicInfo,
    records: result,
  };
}
