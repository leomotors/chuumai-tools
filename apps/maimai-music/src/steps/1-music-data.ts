import { musicDataTable, musicLevelTable } from "@repo/database/maimai";

import { db } from "../db.js";
import { mapMaimaiTitle } from "../duplicate-title.js";
import { environment } from "../environment.js";
import { diffInMusicData } from "../functions/diff-in-music-data.js";
import { processMusicLevels } from "../functions/process-music-levels.js";
import { uploadMissingMusicImages } from "../functions/upload-music-images.js";
import { s3 } from "../s3.js";
import { musicJsonSchema } from "../types.js";

const url = "https://maimai.sega.jp/data/maimai_songs.json";
const s3Folder = "musicImages";

export async function downloadMusicData(version: string) {
  console.log("Step 1: Downloading current music data from official source");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = ((await response.json()) as { catcode?: string }[])
    .map((m) => {
      m.catcode = m?.catcode?.replaceAll("＆", "&");
      return m;
    })
    .filter((m) => m.catcode !== "宴会場");

  const musicData = musicJsonSchema.parse(data).map((m) => ({
    ...m,
    title: mapMaimaiTitle(m.title, m.catcode),
  }));

  console.log(`Found ${musicData.length} music records`);

  console.log("\nStep 2: Compare with existing music data in the database");

  const existingMusicData = await db.select().from(musicDataTable);
  const { newRecords } = diffInMusicData(existingMusicData, musicData);

  if (newRecords.length > 0) {
    await db.insert(musicDataTable).values(
      newRecords.map((m) => ({
        title: m.title,
        category: m.catcode,
        artist: m.artist,
        image: m.image_url,
        // todo version field after first seed
      })),
    );
    console.log(`Successfully inserted ${newRecords.length} new music data`);
  } else {
    console.log("No new music data to insert");
  }

  console.log("\nStep 3: Upload missing music images to S3");
  const uploadResult = await uploadMissingMusicImages(
    s3,
    environment.AWS_BUCKET_NAME,
    s3Folder,
    musicData,
  );

  console.log(
    `Image upload summary: ${uploadResult.uploadedCount} uploaded, ${uploadResult.skippedCount} skipped` +
      (uploadResult.failedCount ? `, ${uploadResult.failedCount} failed` : ""),
  );

  console.log("\nStep 4: Process music level data");
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
