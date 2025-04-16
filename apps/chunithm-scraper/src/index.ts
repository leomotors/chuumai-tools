import fs from "node:fs/promises";

import { eq } from "drizzle-orm";
import { chromium } from "playwright";

import {
  forRatingTable,
  imageCacheTable,
  jobTable,
  musicRecordTable,
  playerDataTable,
  RatingType,
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

const jobId = (await db?.insert(jobTable).values({}).returning())?.[0].id;
console.log(`Created job with ID: ${jobId}`);

const browser = await chromium.launch({
  headless: !process.env.DEBUG,
  args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
});

const page = await browser.newPage();
const pwPage = new PwPage(page);

// * Step 1: Login
await pwPage.runStep("Step 1: Login", (page) => login(page));
await pwPage.runStep("Prepare for Step 2", async (page) => {
  await page.getByRole("link", { name: "PLAYER DATA" }).click();
  await page.waitForURL("https://chunithm-net-eng.com/mobile/home/playerData");
});

// * Step 2: Player Data
const playerData = await pwPage.runStep(
  "Step 2: Player Data",
  scrapePlayerData,
);

// * Step 3: Music Record (For Rating and All)
const musicRecords = await pwPage.runStep(
  "Step 3: Scrape Music Records",
  scrapeMusicRecord,
);

// * Step 4: Create JSON for Image Generation
const imgGenInput = {
  profile: playerData,
  best: musicRecords.bestSongs.map(recordToGenInput),
  new: musicRecords.newSongs.map(recordToGenInput),
} satisfies ImgGenInput;

await fs.writeFile(
  `output-${jobId}.json`,
  JSON.stringify(imgGenInput, null, 2),
);

// * Step 5: Save data to DB
if (db) {
  const charaImage = await db
    .select()
    .from(imageCacheTable)
    .where(eq(imageCacheTable.key, playerData.characterImage));

  if (charaImage.length === 0) {
    const res = await fetch(playerData.characterImage);
    const contentType = res.headers.get("content-type");
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const content = `data:${contentType};base64,${base64}`;

    await db.insert(imageCacheTable).values({
      key: playerData.characterImage,
      value: content,
    });
  }

  await db.insert(playerDataTable).values({
    // @ts-expect-error drizzle issues
    jobId,
    characterRarity: playerData.characterRarity,
    characterImage: playerData.characterImage,
    teamName: playerData.teamName,
    teamEmblem: playerData.teamEmblem,
    honorText: playerData.honorText,
    honorRarity: playerData.honorLevel,
    playerLevel: playerData.playerLevel,
    playerName: playerData.playerName,
    classEmblem: playerData.classEmblem,
    rating: playerData.rating,
    overpowerValue: playerData.overpowerValue,
    overpowerPercent: playerData.overpowerPercent,
    lastPlayed: playerData.lastPlayed,
    currentCurrency: playerData.currentCurrency,
    totalCurrency: playerData.totalCurrency,
    playCount: playerData.playCount,
  });

  await db
    .insert(musicRecordTable)
    .values(
      musicRecords.allRecords
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
    musicRecords.bestSongs.map(recordToGenInputWithFullChain),
    "BEST",
  );
  await insertRating(
    musicRecords.newSongs.map(recordToGenInputWithFullChain),
    "NEW",
  );
  await insertRating(
    musicRecords.selectionSongs.map(recordToGenInputWithFullChain),
    "SELECTION",
  );
}

// * Step 6: Generate Image
// todo

await db?.$client.end();
await browser.close();
