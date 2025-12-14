import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";

import { eq } from "drizzle-orm";
import { chromium } from "playwright";

import { jobTable } from "@repo/database/chuni";

import { stateStoragePath } from "./constants.js";
import { db } from "./db.js";
import { main } from "./main.js";
import { logger } from "./utils/logger.js";

const browser = await chromium.launch({
  headless: !process.env.DEBUG,
  args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
  slowMo: 100,
});

const jobId = (await db?.insert(jobTable).values({}).returning())?.[0].id;

try {
  logger.log(`Starting scraper version: ${APP_VERSION}`);
  logger.log(`Created job with ID: ${jobId}`);

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

  const page = await browser.newPage(options);

  await main(jobId, page);

  await page.context().storageState({ path: stateStoragePath });
} catch (err) {
  await db
    ?.update(jobTable)
    .set({
      jobError: `${err}`,
    })
    .where(eq(jobTable.id, jobId!));
  logger.error(`${err}`);
} finally {
  await db
    ?.update(jobTable)
    .set({
      jobEnd: new Date(),
      jobLog: logger.getMessages().join("\n"),
    })
    .where(eq(jobTable.id, jobId!));

  await browser.close();
  await db?.$client.end();
}
