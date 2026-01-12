import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

import { logger } from "@repo/core/utils";

import { createApiClient } from "./api.js";
import { stateStoragePath } from "./constants.js";
import { environment } from "./environment.js";
import { main } from "./main.js";

logger.log(`Starting scraper version: ${APP_VERSION}`);

const browser = await chromium.launch({
  headless: !process.env.DEBUG,
  args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
  slowMo: 100,
});

// Create API client if service URL is configured
const apiClient = createApiClient();
let jobId: number | undefined;

// Create job via API if both URL and API key are provided
if (apiClient && environment.MAIMAI_SERVICE_API_KEY) {
  const response = await apiClient.POST("/api/jobs/create", { body: {} });

  if (response.error) {
    throw new Error(
      `Failed to create job: ${response.error.message || JSON.stringify(response.error)}`,
    );
  }

  jobId = response.data.jobId;
  logger.log(`Created job with ID: ${jobId} via API`);
} else {
  logger.log("API client not configured, running without job tracking");
}

try {
  // Create folder "outputs" if not exists
  try {
    await mkdir("outputs");
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "EEXIST") {
      throw err;
    }
  }

  const options = existsSync(stateStoragePath)
    ? { storageState: stateStoragePath }
    : undefined;

  if (options) {
    logger.log(`Using existing state storage: ${stateStoragePath}`);
  }

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    timezoneId: "Asia/Bangkok",
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
    ...options,
  });
  const page = await context.newPage();

  await main(jobId, page, apiClient);

  await context.storageState({ path: stateStoragePath });
} catch (err) {
  // Report error to API if configured
  if (apiClient && jobId && environment.MAIMAI_SERVICE_API_KEY) {
    await apiClient.POST("/api/jobs/finish", {
      body: {
        jobId,
        status: "failure",
        jobError: `${err}`,
        jobLog: logger.getMessages().join("\n"),
      },
    });
  }
  logger.error(`${err}`);
} finally {
  // Report completion to API if configured
  if (apiClient && jobId && environment.MAIMAI_SERVICE_API_KEY) {
    await apiClient.POST("/api/jobs/finish", {
      body: {
        jobId,
        status: "success",
        jobLog: logger.getMessages().join("\n"),
      },
    });
  }

  await browser.close();
}
