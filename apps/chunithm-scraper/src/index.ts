import { chromium } from "playwright";

import { jobTable } from "@repo/db-chuni/schema";

import { db } from "./db.js";
import { PwPage } from "./playwright.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
// import { qman } from "./steps/3-qman.js";
// import { genImage } from "./steps/4-genimage.js";

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

// // * Step 3: Qman
// const qmanResult = await pwPage.runStep("Step 3: Qman", (jobId, page, db) =>
//   qman(jobId, page, db, lastPlayed),
// );

// // * Step 4: Generate Image
// await pwPage.runStep(
//   "Step 4: Generate Image",
//   (_, page, __, retried) => genImage(page, qmanResult, retried),
//   3,
// );

await db?.$client.end();
await browser.close();
