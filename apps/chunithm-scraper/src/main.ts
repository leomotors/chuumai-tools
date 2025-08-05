import fs from "node:fs/promises";

import { Page } from "playwright";

import { FullPlayDataInput, ImgGenInput } from "@repo/types/chuni";

import type { RawImageGen } from "@/app/chuni-web/src/lib/types.js";

import { db } from "./db.js";
import { environment } from "./environment.js";
import { readHiddenCharts } from "./hidden.js";
import { recordToGenInput } from "./parser/music.js";
import { handlePwError, Runner } from "./runner.js";
import { fetchPath } from "./scraper.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
import { scrapeMusicRecord } from "./steps/3-music.js";
import { saveToDatabase } from "./steps/6-savedb.js";
import { generateImage } from "./steps/7-image.js";
import { sendDiscordImage } from "./steps/8-discord.js";
import { sendFiles } from "./utils/discord.js";
import { downloadImageAsBase64 } from "./utils/image.js";
import { logger } from "./utils/logger.js";

export async function main(jobId: number | undefined, page: Page) {
  // * Step 0: Preparation
  const hiddenCharts = await readHiddenCharts();

  const runner = new Runner();

  // * Step 1: Login
  await runner.runStep(
    "Step 1: Login",
    () => login(page),
    (ctx) => handlePwError(ctx, page),
  );

  // * Step 2: Player Data
  const playerDataPage = await runner.runStep(
    "Step 2.1: Fetch Player Data",
    () => fetchPath(page, "home/playerData"),
  );

  const { playerData, playerDataHtml } = await runner.runStep(
    "Step 2.2: Process Player Data",
    () => scrapePlayerData(playerDataPage),
    (ctx) => handlePwError(ctx),
  );

  // * Step 3: Music Record (For Rating and All)
  const { recordData, recordHtml } = await runner.runStep(
    "Step 3: Scrape Music Records",
    () => scrapeMusicRecord(page),
  );

  // * Step 4: Create JSON for Image Generation
  const { imgGenInput, imgGenFileName } = await runner.runStep(
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

      const imgGenFileName = `${playerData.lastPlayed.toISOString()}-${jobId}.json`;

      await fs.writeFile(
        `outputs/${imgGenFileName}`,
        JSON.stringify(imgGenInput, null, 2),
      );

      const fullData = {
        ...imgGenInput,
        allRecords: recordData.allRecords
          .filter((r) => r.score > 0)
          .map(recordToGenInput),
      } satisfies FullPlayDataInput;

      const fullDataFileName = `full-${imgGenFileName}`;
      await fs.writeFile(
        `outputs/${fullDataFileName}`,
        JSON.stringify(fullData, null, 2),
      );

      return { imgGenInput, imgGenFileName, fullData, fullDataFileName };
    },
  );

  // * Step 5: Calculate Rating
  const rawImgGen = await runner.runStep(
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
    handlePwError,
    3,
  );

  // * Step 6: Save data to DB
  if (db) {
    await runner
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
        sendFiles("Step 6 Error: Failed saving to database", [
          {
            blob: new Blob([`${err}`], { type: "text/plain" }),
            fileName: `error-step6-${Date.now()}.txt`,
          },
        ]);
      });
  } else {
    logger.warn("Database Mode disabled, skipped saving to DB");
  }

  // * Step 7: Generate Image
  const outputLocation = await runner.runStep(
    "Step 7: Generate Image",
    () => generateImage(page, imgGenFileName),
    (ctx) => handlePwError(ctx, page),
  );

  // * Step 8: Send Image to Discord
  await runner.runStep("Step 8: Send Image to Discord", () =>
    sendDiscordImage(outputLocation, playerData, rawImgGen),
  );
}
