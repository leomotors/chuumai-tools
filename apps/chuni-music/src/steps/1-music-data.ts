import { PgInsertValue } from "drizzle-orm/pg-core";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";

import { db } from "../db.js";
import { environment } from "../environment.js";
import { diffInMusicData } from "../functions/diff-in-music-data.js";
import { uploadMissingMusicImages } from "../functions/upload-music-images.js";
import { s3 } from "../s3.js";
import { musicJsonSchema } from "../types.js";

const url = "https://chunithm.sega.jp/storage/json/music.json";
const s3Folder = "musicImages";

export async function downloadMusicData(version: string) {
  console.log("Step 1: Downloading current music data from official source");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();

  const stdMusicData = musicJsonSchema.parse(data).filter((m) => m.lev_bas);

  console.log("Step 2: Compare with existing music data in the database");
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
  }

  console.log("Step 3: Upload missing music images to S3");
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

  // Section: Chart Level
  const existingChartLevel = await db.select().from(musicLevelTable);

  const payload = [] as PgInsertValue<typeof musicLevelTable>[];
  for (const music of stdMusicData) {
    const levels = [
      { difficulty: "basic" as const, level: music.lev_bas },
      { difficulty: "advanced" as const, level: music.lev_adv },
      { difficulty: "expert" as const, level: music.lev_exp },
      { difficulty: "master" as const, level: music.lev_mas },
      { difficulty: "ultima" as const, level: music.lev_ult },
    ];

    for (const l of levels) {
      if (l.level) {
        payload.push({
          musicId: music.id,
          difficulty: l.difficulty,
          level: l.level,
          version,
        });
      }
    }
  }

  for (const p of payload) {
    const result = existingChartLevel.find(
      (c) =>
        c.musicId === p.musicId &&
        c.difficulty === p.difficulty &&
        c.version === version,
    );
    if (result) {
      if (result.level !== p.level) {
        console.log(
          `Warning: Level mismatch for musicId ${p.musicId} and difficulty ${p.difficulty}. Existing level: ${result.level}, New level: ${p.level}. (Remain as-is)`,
        );
      }
    }
  }

  if (payload.length > 0) {
    await db.insert(musicLevelTable).values(payload).onConflictDoNothing();
  }
}
