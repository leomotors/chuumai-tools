import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";

import { db } from "../db.js";
import { environment } from "../environment.js";
import { diffInMusicData } from "../functions/diff-in-music-data.js";
import { processMusicLevels } from "../functions/process-music-levels.js";
import { uploadMissingMusicImages } from "../functions/upload-music-images.js";
import { s3 } from "../s3.js";
import { musicJsonSchema } from "../types.js";

const url = "https://chunithm.sega.jp/storage/json/music.json";
const s3Folder = "musicImages";

export async function downloadMusicData(version: string) {
  console.log("Step 1.1: Downloading current music data from official source");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();

  const stdMusicData = musicJsonSchema.parse(data).filter((m) => m.lev_bas);

  console.log(`Found ${stdMusicData.length} standard music records`);

  console.log("\nStep 1.2: Compare with existing music data in the database");

  const existingMusicData = await db.select().from(musicDataTable);
  const { newRecords } = diffInMusicData(existingMusicData, stdMusicData);

  if (newRecords.length > 0) {
    await db.insert(musicDataTable).values(
      newRecords.map((m) => ({
        id: m.id,
        category: m.catname,
        title: m.title,
        artist: m.artist,
        image: m.image,
      })),
    );
    console.log(`Successfully inserted ${newRecords.length} new music data`);
  } else {
    console.log("No new music data to insert");
  }

  console.log("\nStep 1.3: Upload missing music images to S3");
  const uploadResult = await uploadMissingMusicImages(
    s3,
    environment.AWS_BUCKET_NAME,
    s3Folder,
    stdMusicData,
  );

  console.log(
    `Image upload summary: ${uploadResult.uploadedCount} uploaded, ${uploadResult.skippedCount} skipped` +
      (uploadResult.failedCount ? `, ${uploadResult.failedCount} failed` : ""),
  );

  console.log("\nStep 1.4: Process music level data");
  const existingChartLevel = await db.select().from(musicLevelTable);
  const levelResult = processMusicLevels(
    stdMusicData,
    existingChartLevel,
    version,
  );

  // Log warnings for level mismatches
  for (const warning of levelResult.warnings) {
    console.log(
      `Warning: Level mismatch for musicId ${warning.musicId} and difficulty ${warning.difficulty}. Existing level: ${warning.existingLevel}, New level: ${warning.newLevel}. (Remain as-is)`,
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
