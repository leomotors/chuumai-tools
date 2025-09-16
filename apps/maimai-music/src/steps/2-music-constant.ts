import { and, eq } from "drizzle-orm";

import { musicDataTable, musicLevelTable } from "@repo/db-maimai/schema";

import { db } from "../db.js";
import { updateMusicConstant as updateMusicConstantLogic } from "../functions/update-music-constant.js";
import { zSchema } from "../types.js";

export async function updateMusicConstant(version: string) {
  console.log("Step 2: Loading external music constant data");

  // Read from temp/data.json (zetaraku format)
  const fs = await import("node:fs");
  const path = await import("node:path");

  const tempDataPath = path.join(process.cwd(), "temp", "data.json");
  const rawData = fs.readFileSync(tempDataPath, "utf8");
  const data = JSON.parse(rawData);

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
  for (const update of result.payload) {
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
      );
  }

  console.log(
    `UpdateMusicConstant: Applied ${result.payload.length} updates, found ${result.nullsCount} nulls, you will have to manually update from other source`,
  );

  if (result.nullsTitle.length > 0) {
    console.log(`Songs with null constants: ${result.nullsTitle.join(", ")}`);
  }
}
