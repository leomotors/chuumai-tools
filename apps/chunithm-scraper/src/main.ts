import fs from "node:fs/promises";

import { Browser } from "playwright";

import {
  forRatingTable,
  musicRecordTable,
  playerDataTable,
  RatingType,
  rawScrapeDataTable,
} from "@repo/db-chuni/schema";
import { BaseChartSchema, ImgGenInput } from "@repo/types-chuni";

import { db } from "./db.js";
import { environment } from "./environment.js";
import {
  recordToGenInput,
  recordToGenInputWithFullChain,
} from "./parser/music.js";
import { PwPage } from "./playwright.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
import { scrapeMusicRecord } from "./steps/3-music.js";
import { downloadImageAsBase64 } from "./utils/image.js";

export async function main(jobId: number | undefined, browser: Browser) {
  const page = await browser.newPage();
  const pwPage = new PwPage(page);

  // * Step 1: Login
  await pwPage.runStep("Step 1: Login", (page) => login(page));
  await pwPage.runStep("Prepare for Step 2", async (page) => {
    await page.getByRole("link", { name: "PLAYER DATA" }).click();
    await page.waitForURL(
      "https://chunithm-net-eng.com/mobile/home/playerData",
    );
  });

  // * Step 2: Player Data
  const { playerData, playerDataHtml } = await pwPage.runStep(
    "Step 2: Player Data",
    scrapePlayerData,
  );

  // * Step 3: Music Record (For Rating and All)
  const { recordData, recordHtml } = await pwPage.runStep(
    "Step 3: Scrape Music Records",
    scrapeMusicRecord,
  );

  // * Step 4: Create JSON for Image Generation
  const charaImageData = await downloadImageAsBase64(playerData.characterImage);

  const imgGenInput = {
    profile: {
      ...playerData,
      characterImage: charaImageData,
    },
    best: recordData.bestSongs.map(recordToGenInput),
    new: recordData.newSongs.map(recordToGenInput),
  } satisfies ImgGenInput;

  await fs.writeFile(
    `output-${jobId}.json`,
    JSON.stringify(imgGenInput, null, 2),
  );

  // * Step 5: Save data to DB
  if (db) {
    const playerDataValue = {
      jobId,
      characterRarity: playerData.characterRarity,
      characterImage: playerData.characterImage,
      teamName: playerData.teamName,
      teamEmblem: playerData.teamEmblem,
      honor1Text: playerData.honorText,
      honor1Rarity: playerData.honorLevel,
      playerLevel: playerData.playerLevel,
      playerName: playerData.playerName,
      classEmblem: playerData.classEmblem,
      rating: playerData.rating.toString(),
      overpowerValue: playerData.overpowerValue.toFixed(2),
      overpowerPercent: playerData.overpowerPercent.toFixed(2),
      lastPlayed: playerData.lastPlayed,
      currentCurrency: playerData.currentCurrency,
      totalCurrency: playerData.totalCurrency,
      playCount: playerData.playCount,
    } satisfies typeof playerDataTable.$inferInsert;

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

    async function insertRating(
      records: Array<BaseChartSchema & { fullChain: number }>,
      ratingType: RatingType,
    ) {
      await db!.insert(forRatingTable).values(
        records.map((record, index) => {
          const recordId = allRecords.find(
            (r) =>
              r.musicId === record.id &&
              r.difficulty === record.difficulty &&
              r.score === record.score &&
              r.clearMark === record.clearMark &&
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

    await insertRating(
      recordData.bestSongs.map(recordToGenInputWithFullChain),
      "BEST",
    );
    await insertRating(
      recordData.newSongs.map(recordToGenInputWithFullChain),
      "NEW",
    );
    await insertRating(
      recordData.selectionSongs.map(recordToGenInputWithFullChain),
      "SELECTION",
    );

    await db.insert(rawScrapeDataTable).values({
      jobId,
      version: environment.VERSION,
      playerDataHtml,
      allMusicRecordHtml: recordHtml,
      dataForImageGen: JSON.stringify(imgGenInput),
    });
  }

  // * Step 6: Generate Image
  // todo

  await db?.$client.end();
  await browser.close();
}
