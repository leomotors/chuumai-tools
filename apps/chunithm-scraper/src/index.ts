import fs from "node:fs/promises";

import { chromium } from "playwright";

import { jobTable } from "@repo/db-chuni/schema";
import { ImgGenInput } from "@repo/types-chuni";

import { db } from "./db.js";
import { recordToGenInput } from "./parser/music.js";
import { PwPage } from "./playwright.js";
import { login } from "./steps/1-login.js";
import { scrapePlayerData } from "./steps/2-playerdata.js";
import { scrapeMusicRecord } from "./steps/3-music.js";

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

// * Step 3: Music Record (For Rating and All)
const musicRecords = await pwPage.runStep(
  "Step 3: Scrape Music Records",
  scrapeMusicRecord,
);

// * Step 4: Create JSON for Image Generation
const imgGenInput = {
  profile: playerData,
  best: musicRecords.bestSongs.map(recordToGenInput),
  new: musicRecords.newSongs.map(recordToGenInput),
} satisfies ImgGenInput;

await fs.writeFile(
  `output-${jobId}.json`,
  JSON.stringify(imgGenInput, null, 2),
);

// * Step 5: Save data to DB

// * Step 6: Generate Image
// todo

await db?.$client.end();
await browser.close();
