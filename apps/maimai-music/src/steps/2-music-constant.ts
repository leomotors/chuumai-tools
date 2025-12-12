import { and, eq } from "drizzle-orm";

import { forInRangeWithProgressBar } from "@repo/core";
import { musicDataTable, musicLevelTable } from "@repo/db-maimai/schema";

import { db } from "../db.js";
import { updateMusicConstant as updateMusicConstantLogic } from "../functions/update-music-constant.js";
import { zSchema } from "../types.js";

const url = "https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json";

export async function updateMusicConstant(version: string) {
  console.log("\nFinal Step: Updating music constants in the database");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();
  data.songs = (data.songs as Array<{ category: string }>).filter(
    (song) => song.category !== "宴会場",
  );
  const musicData = zSchema.parse(data).songs;

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

  // Apply the database updates
  await forInRangeWithProgressBar(
    result.payload,
    async (update) =>
      await db
        .update(musicLevelTable)
        .set({ constant: update.newConstant })
        .where(
          and(
            eq(musicLevelTable.musicTitle, update.musicTitle),
            eq(musicLevelTable.chartType, update.chartType),
            eq(musicLevelTable.difficulty, update.difficulty),
            eq(musicLevelTable.version, update.version),
          ),
        ),
  );

  console.log(
    `UpdateMusicConstant: Applied ${result.payload.length} updates, found ${result.nullsCount} nulls, you will have to manually update from other source`,
  );

  if (result.nullsTitle.length > 0) {
    console.log(
      `Songs with null constants (Update from other source required): ${result.nullsTitle.join(", ")}`,
    );
  }
}
