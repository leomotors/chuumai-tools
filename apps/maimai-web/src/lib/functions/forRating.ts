import { error } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";

import { db } from "$lib/db";

import { calculateRating } from "@repo/core/maimai";
import {
  forRatingTable,
  jobTable,
  musicDataTable,
  musicLevelTable,
  musicRecordTable,
  playerDataTable,
} from "@repo/database/maimai";
import { rawImageGenSchema } from "@repo/types/maimai";
import { z } from "@repo/types/zod";

export const forRatingSchema = rawImageGenSchema
  .extend({
    jobId: z.number(),
    version: z.string().openapi({ examples: ["FESTiVAL PLUS", "BUDDiES"] }),
  })
  .openapi("ForRatingResult");

export type ForRating = z.infer<typeof forRatingSchema>;

export async function getForRating(userId: string) {
  const findJob = await db
    .select({
      jobId: jobTable.id,
    })
    .from(playerDataTable)
    .leftJoin(jobTable, eq(playerDataTable.jobId, jobTable.id))
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(jobTable.id))
    .limit(1);

  const jobId = findJob[0]?.jobId;

  if (!jobId) return null;

  // Get profile data
  const profileData = await db
    .select({
      characterImage: playerDataTable.characterImage,
      honorText: playerDataTable.honorText,
      honorRarity: playerDataTable.honorRarity,
      playerName: playerDataTable.playerName,
      courseRank: playerDataTable.courseRank,
      classRank: playerDataTable.classRank,
      rating: playerDataTable.rating,
      star: playerDataTable.star,
      playCountCurrent: playerDataTable.playCountCurrent,
      playCountTotal: playerDataTable.playCountTotal,
      lastPlayed: playerDataTable.lastPlayed,
    })
    .from(playerDataTable)
    .where(eq(playerDataTable.jobId, jobId))
    .limit(1);

  if (!profileData[0]) error(500, `profile not found for jobId=${jobId}`);

  const versionRow = await db
    .select({ version: forRatingTable.version })
    .from(forRatingTable)
    .where(eq(forRatingTable.jobId, jobId))
    .limit(1);

  const version = versionRow[0]?.version;

  if (!version) error(500, `version invalid for jobId=${jobId}`);

  const result = await db
    .select({
      ratingType: forRatingTable.ratingType,
      order: forRatingTable.order,
      musicTitle: musicDataTable.title,
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
    })
    .from(forRatingTable)
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
    .where(eq(forRatingTable.jobId, jobId));

  const charts = result.map((row) => {
    const constantValue = row.constant
      ? Number(row.constant)
      : parseFloat(row.level);

    const rating = calculateRating(
      row.score,
      constantValue,
      row.comboMark || "NONE",
    );

    return {
      title: row.musicTitle,
      chartType: row.chartType,
      difficulty: row.difficulty,
      score: row.score,
      dxScore: row.dxScore,
      dxScoreMax: row.dxScoreMax,
      comboMark: row.comboMark,
      syncMark: row.syncMark,
      level: constantValue,
      levelSure: row.constant !== null,
      rating,
      image: row.image,
      ratingType: row.ratingType,
    };
  });

  const best = charts.filter((c) => c.ratingType === "OLD");
  const current = charts.filter((c) => c.ratingType === "NEW");

  // maimai uses summation, not average
  const bestSum = best.reduce((acc, cur) => acc + (cur.rating ?? 0), 0);
  const currentSum = current.reduce((acc, cur) => acc + (cur.rating ?? 0), 0);
  const total = bestSum + currentSum;

  const profile = profileData[0];

  return {
    jobId,
    version,
    profile: {
      ...profile,
      lastPlayed: profile.lastPlayed.toISOString(),
    },
    best,
    current,
    rating: {
      bestSum,
      currentSum,
      total,
    },
  } satisfies ForRating;
}
