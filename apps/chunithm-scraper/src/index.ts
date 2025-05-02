import { eq } from "drizzle-orm";
import { chromium } from "playwright";

import { jobTable } from "@repo/db-chuni/schema";

import { db } from "./db.js";
import { main } from "./main.js";

const browser = await chromium.launch({
  headless: !process.env.DEBUG,
  args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
  slowMo: 100,
});

const jobId = (await db?.insert(jobTable).values({}).returning())?.[0].id;

try {
  console.log(`Created job with ID: ${jobId}`);

  await main(jobId, browser);

  await db
    ?.update(jobTable)
    .set({
      jobEnd: new Date(),
    })
    .where(eq(jobTable.id, jobId!));
} catch (err) {
  await db
    ?.update(jobTable)
    .set({
      jobEnd: new Date(),
      jobError: `${err}`,
    })
    .where(eq(jobTable.id, jobId!));
  console.error(err);
} finally {
  await browser.close();
  await db?.$client.end();
}
