import { error, json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { saveJobDataRequestSchema } from "$lib/api/schemas/job";
import { db } from "$lib/db";
import { getUserIdFromApiKey } from "$lib/server/auth";

import {
  forRatingTable,
  jobTable,
  musicRecordTable,
  playerDataTable,
  rawScrapeDataTable,
} from "@repo/database/maimai";
import type { RatingType } from "@repo/types/maimai";

import type { RequestHandler } from "./$types";

/**
 * POST /api/jobs/data
 * Save all scraping data to database
 */
export const POST: RequestHandler = async ({ request }) => {
  // Authenticate using API key
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    error(401, "Unauthorized: API key required in Authorization Bearer header");
  }

  const apiKey = authHeader.substring(7);
  const userId = await getUserIdFromApiKey(apiKey);

  // Parse and validate request body using Zod
  const bodyResult = saveJobDataRequestSchema.safeParse(await request.json());

  if (!bodyResult.success) {
    error(400, `Invalid request body: ${bodyResult.error.message}`);
  }

  const {
    jobId,
    playerData,
    recordData,
    playerDataHtml,
    allMusicRecordHtml,
    imgGenInput,
    version,
  } = bodyResult.data;

  try {
    // Verify the job exists and belongs to the user
    const [existingJob] = await db
      .select({ userId: jobTable.userId })
      .from(jobTable)
      .where(eq(jobTable.id, jobId))
      .limit(1);

    if (!existingJob) {
      error(400, `Job ${jobId} not found`);
    }

    if (existingJob.userId !== userId) {
      error(
        403,
        `Forbidden: Job ${jobId} does not belong to authenticated user`,
      );
    }

    // Insert player data
    await db.insert(playerDataTable).values({
      jobId,
      characterImage: playerData.characterImage,
      honorText: playerData.honorText,
      honorRarity: playerData.honorRarity,
      playerName: playerData.playerName,
      courseRank: playerData.courseRank,
      classRank: playerData.classRank,
      rating: playerData.rating,
      star: playerData.star,
      playCountCurrent: playerData.playCountCurrent,
      playCountTotal: playerData.playCountTotal,
      lastPlayed: new Date(playerData.lastPlayed),
    });

    // Insert all music records
    await db
      .insert(musicRecordTable)
      .values(
        recordData.allRecords.map((record) => ({
          jobId,
          musicTitle: record.title,
          chartType: record.chartType,
          difficulty: record.difficulty,
          score: record.score,
          dxScore: record.dxScore ?? 0,
          dxScoreMax: record.dxScoreMax ?? 0,
          comboMark: record.comboMark ?? "NONE",
          syncMark: record.syncMark ?? "NONE",
        })),
      )
      .onConflictDoNothing();

    // Get all records for this job only
    const allRecords = await db
      .select({
        id: musicRecordTable.id,
        musicTitle: musicRecordTable.musicTitle,
        chartType: musicRecordTable.chartType,
        difficulty: musicRecordTable.difficulty,
        score: musicRecordTable.score,
        dxScore: musicRecordTable.dxScore,
        dxScoreMax: musicRecordTable.dxScoreMax,
        comboMark: musicRecordTable.comboMark,
        syncMark: musicRecordTable.syncMark,
      })
      .from(musicRecordTable)
      .innerJoin(jobTable, eq(musicRecordTable.jobId, jobTable.id))
      .where(eq(jobTable.userId, userId));

    // Helper function to insert rating records
    async function insertRating(
      records: typeof recordData.allRecords,
      ratingType: RatingType,
    ) {
      if (records.length === 0) {
        return;
      }

      await db.insert(forRatingTable).values(
        records.map((record, index) => {
          const recordId = allRecords.find(
            (r) =>
              r.musicTitle === record.title &&
              r.chartType === record.chartType &&
              r.difficulty === record.difficulty &&
              r.score === record.score &&
              r.dxScore === (record.dxScore ?? 0) &&
              r.dxScoreMax === (record.dxScoreMax ?? 0) &&
              r.comboMark === (record.comboMark ?? "NONE") &&
              r.syncMark === (record.syncMark ?? "NONE"),
          )?.id;

          if (!recordId) {
            throw new Error(
              `Insert Database Failure: ${record.title} ${record.chartType} ${record.difficulty} ${record.score} not in musicRecordTable`,
            );
          }

          return {
            jobId,
            musicTitle: record.title,
            recordId,
            ratingType,
            order: index + 1,
            version,
          };
        }),
      );
    }

    // Insert rating breakdowns
    await insertRating(recordData.old, "OLD");
    await insertRating(recordData.new, "NEW");
    await insertRating(recordData.selectionOld, "SELECTION_OLD");
    await insertRating(recordData.selectionNew, "SELECTION_NEW");

    // Insert raw scrape data for debugging
    await db.insert(rawScrapeDataTable).values({
      jobId,
      version,
      playerDataHtml,
      allMusicRecordHtml,
      dataForImageGen: JSON.stringify(imgGenInput),
    });

    return json({
      success: true,
      message: "Job data saved successfully",
      recordsInserted: recordData.allRecords.length,
    });
  } catch (err) {
    // Re-throw known errors
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    console.error("Error saving job data:", err);
    error(500, `Failed to save job data: ${err}`);
  }
};
