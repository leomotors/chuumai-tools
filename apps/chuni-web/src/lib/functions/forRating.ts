import { error } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";

import { db } from "$lib/db";

import { floor } from "@repo/core";
import { calculateRating, constantFromLevel } from "@repo/core/chuni";
import {
  forRatingTable,
  jobTable,
  musicDataTable,
  musicLevelTable,
  musicRecordTable,
  playerDataTable,
} from "@repo/database/chuni";
import { rawImageGenSchema } from "@repo/types/chuni";
import { z } from "@repo/types/zod";

export const forRatingSchema = rawImageGenSchema
  .extend({
    jobId: z.number(),
    version: z.string().openapi({ examples: ["XVRS", "VRS"] }),
  })
  .openapi("ForRatingResult");

export type ForRating = z.infer<typeof forRatingSchema>;

export async function getForRating(userId: string) {
  const findJWord = await db
    .select({
      jobId: jobTable.id,
    })
    .from(playerDataTable)
    .leftJoin(jobTable, eq(playerDataTable.jobId, jobTable.id))
    .where(eq(jobTable.userId, userId))
    .orderBy(desc(jobTable.id))
    .limit(1);

  const jobId = findJWord[0]?.jobId;

  if (!jobId) return null;

  // Get profile data
  const profileData = await db
    .select({
      characterImage: playerDataTable.characterImage,
      characterRarity: playerDataTable.characterRarity,
      teamName: playerDataTable.teamName,
      teamEmblem: playerDataTable.teamEmblem,
      honorText: playerDataTable.mainHonorText,
      honorRarity: playerDataTable.mainHonorRarity,
      playerLevel: playerDataTable.playerLevel,
      playerName: playerDataTable.playerName,
      classBand: playerDataTable.classBand,
      classEmblem: playerDataTable.classEmblem,
      rating: playerDataTable.rating,
      overpowerValue: playerDataTable.overpowerValue,
      overpowerPercent: playerDataTable.overpowerPercent,
      lastPlayed: playerDataTable.lastPlayed,
      playCount: playerDataTable.playCount,
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
      musicId: musicDataTable.id,
      title: musicDataTable.title,
      difficulty: musicRecordTable.difficulty,
      level: musicLevelTable.level,
      constant: musicLevelTable.constant,
      score: musicRecordTable.score,
      clearMark: musicRecordTable.clearMark,
      fc: musicRecordTable.fc,
      aj: musicRecordTable.aj,
      image: musicDataTable.image,
    })
    .from(forRatingTable)
    .innerJoin(
      musicRecordTable,
      eq(forRatingTable.recordId, musicRecordTable.id),
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

  const charts = result.map((row) => {
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
      isHidden: false,
      constant: constantValue,
      constantSure: row.constant !== null,
      rating: calculateRating(row.score, constantValue),
      image: row.image,
      ratingType: row.ratingType,
    };
  });

  const best = charts.filter((c) => c.ratingType === "BEST");
  const current = charts.filter((c) => c.ratingType === "CURRENT");

  const bestAvg = best.reduce((acc, cur) => acc + cur.rating, 0) / 30;
  const currentAvg = current.reduce((acc, cur) => acc + cur.rating, 0) / 20;
  const totalAvg = bestAvg * 0.6 + currentAvg * 0.4;

  const profile = profileData[0];

  return {
    jobId,
    version,
    profile: {
      ...profile,
      rating: Number(profile.rating),
      overpowerValue: Number(profile.overpowerValue),
      overpowerPercent: Number(profile.overpowerPercent),
      classBand: profile.classBand ?? undefined,
      classEmblem: profile.classEmblem ?? undefined,
    },
    best,
    current,
    rating: {
      bestAvg: floor(bestAvg, 4),
      currentAvg: floor(currentAvg, 4),
      totalAvg: floor(totalAvg, 4),
    },
  } satisfies ForRating;
}
