import fs from "node:fs/promises";

import { eq } from "drizzle-orm";
import z from "zod";

import { forInRangeWithProgressBar } from "@repo/core";
import { musicDataTable } from "@repo/database/chuni";

import { db } from "../db";
import { updateReleaseDate as updateReleaseDateLogic } from "../functions/update-release-date.js";
import { beerSchema } from "../types";

export async function updateReleaseDateData() {
  console.log("Step 1: Loading release date data");

  const content = await fs.readFile("temp/songs-beer.json", "utf-8");
  const data = z.array(beerSchema).parse(JSON.parse(content));

  console.log("\nStep 2: Compare with existing data in the database");
  const existingMusicData = await db.select().from(musicDataTable);

  const result = updateReleaseDateLogic(existingMusicData, data);

  if (result.changedRecords.length > 0) {
    console.warn(
      `Warning: ${result.changedRecords.length} songs have changed release dates. Please review them manually (printing first 5):`,
    );
    console.warn(result.changedRecords.slice(0, 5));
  }

  if (result.newRecords.length === 0) {
    console.log("No new release date data to insert.");
    return;
  }

  if (process.env.DRY_RUN) {
    console.log(
      `Dry run mode - not inserting ${result.newRecords.length} new release date records. First 5:`,
    );
    console.log(result.newRecords.slice(0, 5));
    return;
  }

  console.log(`\nStep 3: Applying updates to the database`);
  await forInRangeWithProgressBar(result.newRecords, async (record) => {
    await db
      .update(musicDataTable)
      .set({ releaseDate: record.releaseDate })
      .where(eq(musicDataTable.id, record.songId));
  });

  console.log(
    `UpdateReleaseDate: Applied ${result.newRecords.length} new release date records`,
  );
}
