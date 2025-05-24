import { eq } from "drizzle-orm";
import { chromium } from "playwright";

import { jobTable } from "@repo/db-chuni/schema";

import { db } from "./db.js";
import { logger } from "./logger.js";
import { main } from "./main.js";

const browser = await chromium.launch({
  headless: !process.env.DEBUG,
  args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
  slowMo: 100,
});

const jobId = (await db?.insert(jobTable).values({}).returning())?.[0].id;

try {
  logger.log(`Created job with ID: ${jobId}`);

  await main(jobId, browser);
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
