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
} from "@repo/database/chuni";
import type { RatingType } from "@repo/types/chuni";

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
    calculatedRating,
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
      characterRarity: playerData.characterRarity,
      characterImage: playerData.characterImage,
      teamName: playerData.teamName,
      teamEmblem: playerData.teamEmblem,
      mainHonorText: playerData.mainHonorText,
      mainHonorRarity: playerData.mainHonorRarity,
      subHonor1Text: playerData.subHonor1Text,
      subHonor1Rarity: playerData.subHonor1Rarity,
      subHonor2Text: playerData.subHonor2Text,
      subHonor2Rarity: playerData.subHonor2Rarity,
      playerLevel: playerData.playerLevel,
      playerName: playerData.playerName,
      classBand: playerData.classBand,
      classEmblem: playerData.classEmblem,
      rating: playerData.rating.toString(),
      calculatedRating: calculatedRating?.toString(),
      overpowerValue: playerData.overpowerValue.toFixed(2),
      overpowerPercent: playerData.overpowerPercent.toFixed(2),
      lastPlayed: new Date(playerData.lastPlayed),
      currentCurrency: playerData.currentCurrency,
      totalCurrency: playerData.totalCurrency,
      playCount: playerData.playCount,
    });

    // Insert all music records
    await db
      .insert(musicRecordTable)
      .values(
        recordData.allRecords.map((record) => ({
          jobId,
          musicId: record.id,
          difficulty: record.difficulty,
          score: record.score,
          clearMark: record.clearMark ?? null,
          fc: record.fc,
          aj: record.aj,
          fullChain: record.fullChain,
        })),
      )
      .onConflictDoNothing();

    // Get all records for this job only
    const allRecords = await db
      .select({
        id: musicRecordTable.id,
        musicId: musicRecordTable.musicId,
        difficulty: musicRecordTable.difficulty,
        score: musicRecordTable.score,
        clearMark: musicRecordTable.clearMark,
        fc: musicRecordTable.fc,
        aj: musicRecordTable.aj,
        fullChain: musicRecordTable.fullChain,
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
              r.musicId === record.id &&
              r.difficulty === record.difficulty &&
              r.score === record.score &&
              r.clearMark === (record.clearMark ?? null) &&
              r.fc === record.fc &&
              r.aj === record.aj &&
              r.fullChain === record.fullChain,
          )?.id;

          if (!recordId) {
            throw new Error(
              `Insert Database Failure: ${record.id} ${record.difficulty} ${record.score} ${record.clearMark} ${record.fc} ${record.aj} ${record.fullChain} not in musicRecordTable`,
            );
          }

          return {
            jobId,
            musicId: record.id,
            recordId,
            ratingType,
            order: index + 1,
            version,
          };
        }),
      );
    }

    // Insert rating breakdowns
    await insertRating(recordData.best, "BEST");
    await insertRating(recordData.current, "CURRENT");
    await insertRating(recordData.selectionBest, "SELECTION_BEST");
    await insertRating(recordData.selectionCurrent, "SELECTION_CURRENT");

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
