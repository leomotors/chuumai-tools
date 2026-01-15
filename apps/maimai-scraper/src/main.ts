import fs from "node:fs/promises";

import { Page } from "playwright";

import { fetchPath } from "@repo/core/scraper";
import { downloadImageAsBase64, logger } from "@repo/core/utils";
import { FullPlayDataInput, ImgGenInput } from "@repo/types/maimai";

import type { ApiClient } from "./api.js";
import { mobileBaseURL } from "./constants.js";
import { environment } from "./environment.js";
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

  const runner = new Runner();

  // * Step 1: Login
  const { cached } = await runner.runStep(
    "Step 1: Login",
    () => login(page),
    (ctx) => handlePwError(ctx, page),
  );
  logger.log(`Login cached: ${cached}`);

  // * Step 2: Player Data
  const playerDataPage = await runner.runStep(
    "Step 2.1: Fetch Player Data",
    () => fetchPath(page, mobileBaseURL + "playerData/"),
    handlePwError,
    3,
  );

  const { playerData, playerDataHtml } = await runner.runStep(
    "Step 2.2: Process/Parse Player Data",
    () => scrapePlayerData(playerDataPage),
    (ctx) => handlePwError(ctx, page),
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // * Step 3: Music Record (For Rating and All)
  const { recordData, recordHtml } = await runner.runStep(
    "Step 3: Get Music for Rating and All",
    () => scrapeMusicRecord(page),
  );

  // * Step 4: Scrape History
  const historyHTML = await runner.runStep(
    "Step 4.1: Scrape History",
    () => fetchPath(page, mobileBaseURL + "record/"),
    handlePwError,
    3,
  );

  const historyData = await runner.runStep(
    "Step 4.2: Process/Parse History Data",
    () => processHistoryData(historyHTML),
  );

  const lastPlayed = historyData[0]?.playedAt as string | undefined;

  if (!lastPlayed) {
    console.log(
      "WARNING: No history data found, last played date will be missing",
    );
  }

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
          lastPlayed: lastPlayed ?? "2026-01-01T00:00:00.000Z",
        },
        best: recordData.bestSongs,
        current: recordData.currentSongs,
        scraperVersion: APP_VERSION,
      } satisfies ImgGenInput;

      const imgGenFileName = `${lastPlayed}-${jobId}.json`;

      await fs.writeFile(
        `outputs/${imgGenFileName}`,
        JSON.stringify(imgGenInput, null, 2),
      );

      const fullData = {
        ...imgGenInput,
        allRecords: recordData.allRecords.filter((r) => r.score > 0),
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
      if (!environment.MAIMAI_SERVICE_URL || !apiClient) {
        logger.warn(
          "MAIMAI_SERVICE_URL is not set. Skipping rating calculation.",
        );
        return;
      }

      const res = await apiClient.POST("/api/calcRating", {
        body: {
          data: imgGenInput,
          version: environment.VERSION,
        },
      });

      if (res.error) {
        logger.error(
          `Failed to call calculate rating API: ${res.response.status} ${res.response.statusText} ${res.error}`,
        );
        return undefined;
      }

      return res.data;
    },
    handlePwError,
    3,
  );

  // * Step 6: Save data to Service
  if (apiClient && environment.MAIMAI_SERVICE_API_KEY && jobId) {
    await runner.runStep("Step 6: Save data to Service", async () => {
      await saveDataToService(jobId, apiClient, {
        imgGenInput,
        fullPlayDataInput: fullData,
        recordData,
        playerDataHtml,
        allMusicRecordHtml: recordHtml,
        calculatedRating: rawImgGen?.rating.total,
        lastPlayed: lastPlayed ?? "2026-01-01T00:00:00.000Z",
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
