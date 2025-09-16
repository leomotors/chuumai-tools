import { musicDataTable, musicLevelTable } from "@repo/db-maimai/schema";

import { db } from "../db.js";
import { diffInMusicData } from "../functions/diff-in-music-data.js";
import { processMusicLevels } from "../functions/process-music-levels.js";
import { musicJsonSchema } from "../types.js";

// For now, we'll use the local temp files instead of fetching from a URL
// In production, this would fetch from maimai's official API or data source

export async function downloadMusicData(version: string) {
  console.log("Step 1: Loading music data from local temp files");

  // Read from temp/maimai_songs.json
  const fs = await import("node:fs");
  const path = await import("node:path");

  const tempDataPath = path.join(process.cwd(), "temp", "maimai_songs.json");
  const rawData = fs.readFileSync(tempDataPath, "utf8");
  const data = JSON.parse(rawData);

  const musicData = musicJsonSchema.parse(data);

  console.log(`Found ${musicData.length} music records`);

  console.log("\nStep 2: Compare with existing music data in the database");

  const existingMusicData = await db.select().from(musicDataTable);
  const { newRecords } = diffInMusicData(existingMusicData, musicData);

  if (newRecords.length > 0) {
    await db.insert(musicDataTable).values(
      newRecords.map((m) => ({
        title: m.title,
        sort: m.sort,
        category: m.catcode,
        artist: m.artist,
        image: m.image_url,
      })),
    );
    console.log(`Successfully inserted ${newRecords.length} new music data`);
  } else {
    console.log("No new music data to insert");
  }

  console.log("\nStep 3: Process music level data");
  const existingChartLevel = await db.select().from(musicLevelTable);
  const levelResult = processMusicLevels(
    musicData,
    existingChartLevel,
    version,
  );

  // Log warnings for level mismatches
  for (const warning of levelResult.warnings) {
    console.log(
      `Warning: Level mismatch for musicTitle ${warning.musicTitle}, chartType ${warning.chartType}, and difficulty ${warning.difficulty}. Existing level: ${warning.existingLevel}, New level: ${warning.newLevel}. (Remain as-is)`,
    );
  }

  if (levelResult.payload.length > 0) {
    await db
      .insert(musicLevelTable)
      .values(levelResult.payload)
      .onConflictDoNothing();
    console.log(
      `Successfully inserted ${levelResult.payload.length} new music level records`,
    );
  }

  if (levelResult.skippedCount > 0) {
    console.log(
      `Skipped ${levelResult.skippedCount} existing music level records`,
    );
  }
}
