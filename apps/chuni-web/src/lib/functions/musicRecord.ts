import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

import { db } from "$lib/db";

import {
  jobTable,
  musicDataTable,
  musicRecordTable,
  playerDataTable,
} from "@repo/database/chuni";
import { clearMarkValues, stdChartDifficultyValues } from "@repo/types/chuni";
import { z } from "@repo/types/zod";

const musicRecordItemSchema = z
  .object({
    difficulty: z.enum(stdChartDifficultyValues),
    score: z.number(),
    clearMark: z.enum(clearMarkValues).nullable(),
    fc: z.boolean(),
    aj: z.boolean(),
    fullChain: z.number(),
    lastPlayed: z.coerce.date().nullable(),
  })
  .openapi("MusicRecordItem");

const musicInfoSchema = z
  .object({
    id: z.number(),
    category: z.string(),
    title: z.string(),
    artist: z.string(),
    image: z.string(),
    version: z.string().nullable(),
  })
  .openapi("MusicInfo");

export const musicRecordSchema = z
  .object({
    musicInfo: musicInfoSchema,
    records: z.object({
      basic: z.array(musicRecordItemSchema),
      advanced: z.array(musicRecordItemSchema),
      expert: z.array(musicRecordItemSchema),
      master: z.array(musicRecordItemSchema),
      ultima: z.array(musicRecordItemSchema).nullable(),
    }),
  })
  .openapi("MusicRecord");

export type MusicRecord = z.infer<typeof musicRecordSchema>;

export async function getMusicRecord(userId: string, musicId: number) {
  const musicInfo = (
    await db.select().from(musicDataTable).where(eq(musicDataTable.id, musicId))
  )[0];

  if (!musicInfo) {
    error(404, "Music not found");
  }

  const result = await db
    .select({
      difficulty: musicRecordTable.difficulty,
      score: musicRecordTable.score,
      clearMark: musicRecordTable.clearMark,
      fc: musicRecordTable.fc,
      aj: musicRecordTable.aj,
      fullChain: musicRecordTable.fullChain,
      lastPlayed: playerDataTable.lastPlayed,
    })
    .from(musicRecordTable)
    .innerJoin(jobTable, eq(musicRecordTable.jobId, jobTable.id))
    .leftJoin(playerDataTable, eq(jobTable.id, playerDataTable.jobId))
    .where(
      and(eq(jobTable.userId, userId), eq(musicRecordTable.musicId, musicId)),
    );

  const ultima = result.filter((r) => r.difficulty === "ultima");

  return {
    musicInfo,
    records: {
      basic: result.filter((r) => r.difficulty === "basic"),
      advanced: result.filter((r) => r.difficulty === "advanced"),
      expert: result.filter((r) => r.difficulty === "expert"),
      master: result.filter((r) => r.difficulty === "master"),
      ultima: ultima ? ultima : null,
    },
  };
}
