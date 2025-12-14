import { and, eq } from "drizzle-orm";

import { forInRangeWithProgressBar } from "@repo/core";
import { musicDataTable, musicLevelTable } from "@repo/database/chuni";

import { db } from "../db.js";
import { updateMusicConstant as updateMusicConstantLogic } from "../functions/update-music-constant.js";
import { zSchema } from "../types.js";

const url = "https://dp4p6x0xfi5o9.cloudfront.net/chunithm/data.json";

export async function updateMusicConstantZerataku(version: string) {
  console.log("Step 1: Downloading chart constant data from community source");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();

  const musicData = zSchema.parse(data).songs;

  console.log("\nStep 2: Compare with existing data in the database");
  const existingMusicData = await db.select().from(musicDataTable);
  const existingLevelData = await db.select().from(musicLevelTable);

  // Use the extracted logic function to get the updates
  const result = await updateMusicConstantLogic(
    version,
    existingMusicData,
    existingLevelData,
    musicData,
  );

  // Print warnings if any
  if (result.warnings) {
    console.log(result.warnings.trim());
  }

  // Dry run
  if (process.env.DRY_RUN) {
    console.log("Dry Run enabled - no database updates will be applied");
    console.log(result.payload);
    return;
  }

  console.log(`\nStep 3: Applying updates to the database`);
  // Apply the database updates
  await forInRangeWithProgressBar(result.payload, async (update) => {
    await db
      .update(musicLevelTable)
      .set({ constant: update.newConstant })
      .where(
        and(
          eq(musicLevelTable.musicId, update.songId),
          eq(musicLevelTable.difficulty, update.difficulty),
          eq(musicLevelTable.version, update.version),
        ),
      );
  });

  console.log(
    `UpdateMusicConstant: Applied ${result.payload.length} updates, found ${result.nullsCount} nulls`,
  );

  if (result.nullsTitle.length > 0) {
    console.log(
      `Songs with null constants (Update from other source required): ${result.nullsTitle.join(", ")}`,
    );
  }
}
