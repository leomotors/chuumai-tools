import {
  forRatingTable,
  musicRecordTable,
  playerDataTable,
  rawScrapeDataTable,
} from "@repo/database/chuni";
import type {
  BaseChartSchema,
  ImgGenInput,
  RatingType,
} from "@repo/types/chuni";

import type { Db } from "../db.js";
import { environment } from "../environment.js";
import { recordToGenInputWithFullChain } from "../parser/music.js";
import { logger } from "../utils/logger.js";
import type { scrapePlayerData } from "./2-playerdata.js";
import type { scrapeMusicRecord } from "./3-music.js";

type Params = {
  playerData: Awaited<ReturnType<typeof scrapePlayerData>>["playerData"];
  recordData: Awaited<ReturnType<typeof scrapeMusicRecord>>["recordData"];
  playerDataHtml: string;
  allMusicRecordHtml: string;
  imgGenInput: ImgGenInput;
  calculatedRating: number | undefined;
};

async function insertRating(
  jobId: number,
  db: Db,
  allRecords: Array<typeof musicRecordTable.$inferSelect>,
  records: Array<BaseChartSchema & { fullChain: number }>,
  ratingType: RatingType,
) {
  if (records.length === 0) {
    logger.log(`Note: No data for ${ratingType}`);
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
        ratingType: ratingType,
        order: index + 1,
        version: environment.VERSION,
      };
    }),
  );
}

export async function saveToDatabase(
  jobId: number,
  db: Db,
  {
    playerData,
    recordData,
    playerDataHtml,
    allMusicRecordHtml,
    imgGenInput,
    calculatedRating,
  }: Params,
) {
  const playerDataValue = {
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
    lastPlayed: playerData.lastPlayed,
    currentCurrency: playerData.currentCurrency,
    totalCurrency: playerData.totalCurrency,
    playCount: playerData.playCount,
  } satisfies typeof playerDataTable.$inferInsert;

  try {
    await db.insert(playerDataTable).values(playerDataValue);

    await db
      .insert(musicRecordTable)
      .values(
        recordData.allRecords
          .map(recordToGenInputWithFullChain)
          .map((record) => ({
            jobId,
            musicId: record.id,
            difficulty: record.difficulty,
            score: record.score,
            clearMark: record.clearMark,
            fc: record.fc,
            aj: record.aj,
            fullChain: record.fullChain,
          })),
      )
      .onConflictDoNothing();

    const allRecords = await db.select().from(musicRecordTable);

    await insertRating(
      jobId,
      db,
      allRecords,
      recordData.bestSongs.map(recordToGenInputWithFullChain),
      "BEST",
    );
    await insertRating(
      jobId,
      db,
      allRecords,
      recordData.currentSongs.map(recordToGenInputWithFullChain),
      "CURRENT",
    );
    await insertRating(
      jobId,
      db,
      allRecords,
      recordData.selectionBestSongs.map(recordToGenInputWithFullChain),
      "SELECTION_BEST",
    );
    await insertRating(
      jobId,
      db,
      allRecords,
      recordData.selectionCurrentSongs.map(recordToGenInputWithFullChain),
      "SELECTION_CURRENT",
    );
  } finally {
    await db.insert(rawScrapeDataTable).values({
      jobId,
      version: environment.VERSION,
      playerDataHtml,
      allMusicRecordHtml,
      dataForImageGen: JSON.stringify(imgGenInput),
    });
  }
}
