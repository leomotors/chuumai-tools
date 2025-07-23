import cliProgress from "cli-progress";
import { and, eq } from "drizzle-orm";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";

import { db } from "../db.js";
import { zSchema } from "../types.js";

const url = "https://dp4p6x0xfi5o9.cloudfront.net/chunithm/data.json";

export async function updateMusicConstant(version: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = await response.json();

  const musicData = zSchema.parse(data).songs;

  const existingMusicData = await db.select().from(musicDataTable);
  const existingLevelData = await db.select().from(musicLevelTable);

  const progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  progress.start(musicData.length, 0);
  let nulls = 0;
  for (let i = 0; i < musicData.length; i++) {
    const song = musicData[i];
    const foundSong = existingMusicData.filter((m) => m.title === song.title);

    if (foundSong.length === 0) {
      // console.log(`Song not found in DB: ${song.title}`);
      continue;
    }

    if (foundSong.length > 1) {
      console.log(
        `Multiple songs found in DB: ${song.title}, you have to manually set chart constant value!`,
      );
      continue;
    }

    const songId = foundSong[0].id;

    for (const sheet of song.sheets) {
      if (sheet.type === "std") {
        const difficulty = sheet.difficulty;
        const internalLevel = sheet.internalLevel;

        const existingData = existingLevelData.filter(
          (m) =>
            m.musicId === songId &&
            m.difficulty === difficulty &&
            m.version === version,
        );

        if (existingData.length === 0) {
          console.log(
            `Unexpected Error: Music level not found in DB: ${song.title}, ${difficulty}, ${version}`,
          );
          continue;
        }

        const existingConstant = existingData[0].constant;

        if (internalLevel === null) {
          if (existingConstant === null) {
            nulls++;
            continue;
          }
        } else {
          if (internalLevel !== existingConstant && existingConstant !== null) {
            console.log(
              `Constant value mismatch: ${song.title}, ${difficulty}, ${version}, Existing: ${internalLevel} != New: ${existingConstant}`,
            );
          }

          if (internalLevel !== existingConstant) {
            await db
              .update(musicLevelTable)
              .set({ constant: internalLevel })
              .where(
                and(
                  eq(musicLevelTable.musicId, songId),
                  eq(musicLevelTable.difficulty, difficulty),
                  eq(musicLevelTable.version, version),
                ),
              );
          }
        }
      }
    }

    progress.update(i + 1);
  }
  progress.stop();

  console.log(
    `UpdateMusicConstant: Found ${nulls} nulls, you will have to manually update from other source`,
  );
}
