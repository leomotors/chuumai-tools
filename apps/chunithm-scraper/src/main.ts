import fs from "node:fs/promises";

import { Browser } from "playwright";

import { ImgGenInput } from "@repo/types-chuni";

import type { RawImageGen } from "@/app/chuni-web/src/lib/types.js";

import { db } from "./db.js";
import { environment } from "./environment.js";
import { readHiddenCharts } from "./hidden.js";
import { logger } from "./logger.js";
import { recordToGenInput } from "./parser/music.js";
import { PwPage } from "./playwright.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
import { scrapeMusicRecord } from "./steps/3-music.js";
import { saveToDatabase } from "./steps/6-savedb.js";
import { generateImage } from "./steps/7-image.js";
import { sendDiscordImage } from "./steps/8-discord.js";
import { downloadImageAsBase64 } from "./utils/image.js";

export async function main(jobId: number | undefined, browser: Browser) {
  // * Step 0: Preparation
  const hiddenCharts = await readHiddenCharts();

  const page = await browser.newPage();
  const pwPage = new PwPage(page);

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
  const { imgGenInput, fileName } = await pwPage.runStep(
    "Step 4: Create JSON for Image Generation",
    async () => {
      const charaImageData = await downloadImageAsBase64(
        playerData.characterImage,
      );

      const imgGenInput = {
        profile: {
          ...playerData,
          characterImage: charaImageData,
          honorText: playerData.mainHonorText,
          honorRarity: playerData.mainHonorRarity,
        },
        best: recordData.bestSongs.map(recordToGenInput),
        current: recordData.currentSongs.map(recordToGenInput),
        hidden: hiddenCharts || undefined,
      } satisfies ImgGenInput;

      const fileName = `${playerData.lastPlayed.toISOString()}-${jobId}.json`;

      await fs.writeFile(
        `outputs/${fileName}`,
        JSON.stringify(imgGenInput, null, 2),
      );

      return { imgGenInput, fileName };
    },
  );

  // * Step 5: Calculate Rating
  const rawImgGen = await pwPage.runStep(
    "Step 5: Calculate Rating",
    async () => {
      if (!environment.IMAGE_GEN_URL) {
        logger.warn("IMAGE_GEN_URL is not set. Skipping rating calculation.");
        return;
      }

      const res = await fetch(environment.IMAGE_GEN_URL + "/api/calcRating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: imgGenInput,
          version: environment.VERSION,
        }),
      });

      if (!res.ok) {
        logger.error(
          `Failed to call calculate rating API: ${res.status} ${res.statusText} ${await res.text()}`,
        );
        return undefined;
      }

      return (await res.json()) as RawImageGen;
    },
  );

  // * Step 6: Save data to DB
  if (db) {
    await pwPage
      .runStep("Step 6: Save to DB", async () => {
        await saveToDatabase(jobId!, db!, {
          playerData,
          recordData,
          playerDataHtml,
          allMusicRecordHtml: recordHtml,
          imgGenInput,
          calculatedRating: rawImgGen?.rating.totalAvg,
        });
      })
      .catch((err) => {
        logger.error(`Step 6 Error: ${err}`);
      });
  } else {
    logger.warn("Database Mode disabled, skipped saving to DB");
  }

  // * Step 7: Generate Image
  const outputLocation = await pwPage.runStep(
    "Step 7: Generate Image",
    (page) => generateImage(page, fileName),
  );

  // * Step 8: Send Image to Discord
  await pwPage.runStep("Step 8: Send Image to Discord", () =>
    sendDiscordImage(outputLocation, playerData, rawImgGen),
  );
}
