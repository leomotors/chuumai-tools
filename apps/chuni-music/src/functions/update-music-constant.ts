import cliProgress from "cli-progress";
import z from "zod";

import {
  musicDataTable,
  musicLevelTable,
  StdChartDifficulty,
} from "@repo/db-chuni/schema";

import { zSchema } from "../types";

export async function updateMusicConstant(
  version: string,
  existingMusicData: (typeof musicDataTable.$inferSelect)[],
  existingLevelData: (typeof musicLevelTable.$inferSelect)[],
  newData: z.infer<typeof zSchema>["songs"],
) {
  const progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  progress.start(newData.length, 0);

  let nullsCount = 0;
  const nullsTitle: string[] = [];
  let warnings = "";
  const payload: Array<{
    songId: number;
    difficulty: StdChartDifficulty;
    version: string;
    newConstant: string;
  }> = [];

  for (let i = 0; i < newData.length; i++) {
    const song = newData[i];
    const foundSong = existingMusicData.filter((m) => m.title === song.title);

    if (foundSong.length === 0) {
      // Song might be deleted
      continue;
    }

    if (foundSong.length > 1) {
      warnings += `Multiple songs found in DB: ${song.title}, you have to manually set chart constant value!\n`;

      continue;
    }

    const songId = foundSong[0].id;

    for (const sheet of song.sheets) {
      if (sheet.type !== "std") {
        continue;
      }

      const difficulty = sheet.difficulty;
      const internalLevel = sheet.internalLevel;

      const existingData = existingLevelData.filter(
        (m) =>
          m.musicId === songId &&
          m.difficulty === difficulty &&
          m.version === version,
      );

      if (existingData.length === 0) {
        // Song might be deleted
        continue;
      }

      const existingConstant = existingData[0].constant;

      if (internalLevel === null) {
        if (existingConstant === null) {
          // Both new and existing constants are null
          nullsCount++;
          nullsTitle.push(song.title);
          continue;
        }
      } else {
        if (internalLevel !== existingConstant && existingConstant !== null) {
          warnings += `Constant value mismatch: ${song.title}, ${difficulty}, ${version}, Existing: ${internalLevel} != New: ${existingConstant}\n`;
        }

        if (internalLevel !== existingConstant) {
          payload.push({
            songId,
            difficulty,
            version,
            newConstant: internalLevel,
          });
        }
      }
    }

    progress.update(i + 1);
  }
  progress.stop();

  return {
    nullsCount,
    nullsTitle,
    warnings,
    payload,
  };
}
