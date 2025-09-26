import z from "zod";

import {
  type ChartType,
  musicDataTable,
  musicLevelTable,
  type StdChartDifficulty,
} from "@repo/db-maimai/schema";
import { forWithProgressBar } from "@repo/utils";

import { zSchema } from "../types.js";

export async function updateMusicConstant(
  version: string,
  existingMusicData: (typeof musicDataTable.$inferSelect)[],
  existingLevelData: (typeof musicLevelTable.$inferSelect)[],
  newData: z.infer<typeof zSchema>["songs"],
) {
  let nullsCount = 0;
  const nullsTitle: string[] = [];
  let warnings = "";
  const payload: Array<{
    musicTitle: string;
    chartType: ChartType;
    difficulty: StdChartDifficulty;
    version: string;
    newConstant: string;
  }> = [];

  await forWithProgressBar(newData.length, (i) => {
    const song = newData[i];
    const foundSong = existingMusicData.filter((m) => m.title === song.title);

    if (foundSong.length === 0) {
      // Song might be deleted
      return;
    }

    if (foundSong.length > 1) {
      warnings += `Multiple songs found in DB: ${song.title}, you have to manually set chart constant value!\n`;
      return;
    }

    const musicTitle = foundSong[0].title;

    for (const sheet of song.sheets) {
      const chartType = sheet.type;
      const difficulty = sheet.difficulty;
      const internalLevel = sheet.internalLevel;

      const existingData = existingLevelData.filter(
        (m) =>
          m.musicTitle === musicTitle &&
          m.chartType === chartType &&
          m.difficulty === difficulty &&
          m.version === version,
      );

      if (existingData.length === 0) {
        // Level might be missing for this version
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
          warnings += `Constant value mismatch: ${song.title}, ${chartType}, ${difficulty}, ${version}, Existing: ${internalLevel} != New: ${existingConstant}\n`;
        }

        if (internalLevel !== existingConstant) {
          payload.push({
            musicTitle,
            chartType,
            difficulty,
            version,
            newConstant: internalLevel,
          });
        }
      }
    }
  });

  return {
    nullsCount,
    nullsTitle,
    warnings,
    payload,
  };
}
