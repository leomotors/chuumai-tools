import fs from "node:fs/promises";

import { Browser } from "playwright";

import { ImgGenInput } from "@repo/types-chuni";

import { db } from "./db.js";
import { recordToGenInput } from "./parser/music.js";
import { PwPage } from "./playwright.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
import { scrapeMusicRecord } from "./steps/3-music.js";
import { saveToDatabase } from "./steps/5-savedb.js";
import { generateImage } from "./steps/6-image.js";
import { downloadImageAsBase64 } from "./utils/image.js";

export async function main(jobId: number | undefined, browser: Browser) {
  const page = await browser.newPage();
  const pwPage = new PwPage(page);

  // * Step 0: Preparation
  // Create folder "outputs" if not exists
  try {
    await fs.mkdir("outputs");
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "EEXIST") {
      throw err;
    }
  }

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
      honorText: playerData.mainHonorText,
      honorRarity: playerData.mainHonorRarity,
    },
    best: recordData.bestSongs.map(recordToGenInput),
    current: recordData.currentSongs.map(recordToGenInput),
  } satisfies ImgGenInput;

  const fileName = `${playerData.lastPlayed.toISOString()}-${jobId}.json`;

  await fs.writeFile(
    `outputs/${fileName}`,
    JSON.stringify(imgGenInput, null, 2),
  );

  // * Step 5: Save data to DB
  if (db) {
    await pwPage.runStep("Step 5: Save to DB", async () => {
      await saveToDatabase(jobId!, db!, {
        playerData,
        recordData,
        playerDataHtml,
        allMusicRecordHtml: recordHtml,
        imgGenInput,
      });
    });
  } else {
    console.warn("Database Mode disabled, skipped saving to DB");
  }

  // * Step 6: Generate Image
  await pwPage.runStep("Step 6: Generate Image", (page) =>
    generateImage(page, fileName),
  );
}
