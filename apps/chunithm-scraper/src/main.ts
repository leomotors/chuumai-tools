import fs from "node:fs/promises";

import { Page } from "playwright";

import { fetchPath } from "@repo/core/scraper";
import { downloadImageAsBase64, logger } from "@repo/core/utils";
import {
  FullPlayDataInput,
  ImgGenInput,
  type RawImageGen,
} from "@repo/types/chuni";

import type { ApiClient } from "./api.js";
import { mobileBaseURL } from "./constants.js";
import { environment } from "./environment.js";
import { readHiddenCharts } from "./hidden.js";
import { recordToGenInput } from "./parser/music.js";
import { handlePwError, Runner } from "./runner.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
import { scrapeMusicRecord } from "./steps/3-music.js";
import { processHistoryData } from "./steps/4-history.js";
import { saveDataToService } from "./steps/6-savedata.js";
import { generateImage } from "./steps/7-image.js";
import { sendDiscordImage } from "./steps/8-discord.js";

export async function main(
  jobId: number | undefined,
  page: Page,
  apiClient: ApiClient | null,
) {
  const start = performance.now();

  // * Step 0: Preparation
  const hiddenCharts = await readHiddenCharts();

  const runner = new Runner();

  // * Step 1: Login
  const { cached } = await runner.runStep(
    "Step 1: Login",
    () => login(page),
    (ctx) => handlePwError(ctx, page),
  );

  // * Step 2: Player Data
  const playerDataPage = await runner.runStep(
    "Step 2.1: Fetch Player Data",
    () => fetchPath(page, mobileBaseURL + "home/playerData"),
    handlePwError,
    3,
  );

  const { playerData, playerDataHtml } = await runner.runStep(
    "Step 2.2: Process Player Data",
    () => scrapePlayerData(playerDataPage),
    (ctx) => handlePwError(ctx),
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // * Step 3: Music Record (For Rating and All)
  const { recordData, recordHtml } = await runner.runStep(
    "Step 3: Scrape Music Records",
    () => scrapeMusicRecord(page),
  );

  // * Step 4: Scrape History
  const historyHTML = await runner.runStep(
    "Step 4.1: Scrape History",
    () => fetchPath(page, mobileBaseURL + "record/playlog"),
    handlePwError,
    3,
  );

  const historyData = await runner.runStep(
    "Step 4.2: Process/Parse History Data",
    () => processHistoryData(historyHTML),
  );

  const timeForScrape = performance.now() - start;

  // * Step 5.1: Create JSON for Image Generation
  const { imgGenInput, imgGenFileName, fullData } = await runner.runStep(
    "Step 5.1: Create JSON for Image Generation",
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
        scraperVersion: APP_VERSION,
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
        history: historyData,
      } satisfies FullPlayDataInput;

      const fullDataFileName = `full-${imgGenFileName}`;
      await fs.writeFile(
        `outputs/${fullDataFileName}`,
        JSON.stringify(fullData, null, 2),
      );

      return { imgGenInput, imgGenFileName, fullData, fullDataFileName };
    },
  );

  // * Step 5.2: Calculate Rating
  const rawImgGen = await runner.runStep(
    "Step 5.2: Calculate Rating",
    async () => {
      if (!environment.CHUNI_SERVICE_URL) {
        logger.warn(
          "CHUNI_SERVICE_URL is not set. Skipping rating calculation.",
        );
        return;
      }

      const res = await fetch(
        environment.CHUNI_SERVICE_URL + "/api/calcRating",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: imgGenInput,
            version: environment.VERSION,
          }),
        },
      );

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

  // * Step 6: Save data to Service
  if (apiClient && environment.CHUNI_SERVICE_API_KEY && jobId) {
    await runner.runStep("Step 6: Save data to Service", async () => {
      await saveDataToService(jobId, apiClient, {
        playerData,
        recordData,
        fullPlayDataInput: fullData,
        playerDataHtml,
        allMusicRecordHtml: recordHtml,
        imgGenInput,
        calculatedRating: rawImgGen?.rating.totalAvg,
      });
    });
  } else {
    logger.warn("Service API not configured, skipped saving data");
  }

  // * Step 7: Generate Image
  const startGenerateImage = performance.now();
  const outputLocation = await runner.runStep(
    "Step 7: Generate Image",
    () => generateImage(page, imgGenFileName),
    (ctx) => handlePwError(ctx, page),
  );
  const timeForImageGen = performance.now() - startGenerateImage;

  // * Step 8: Send Image to Discord
  await runner.runStep("Step 8: Send Image to Discord", () =>
    sendDiscordImage(outputLocation, playerData, rawImgGen, cached, {
      startTime: start,
      scrapeTimeMs: timeForScrape,
      imageGenTimeMs: timeForImageGen,
    }),
  );
}
