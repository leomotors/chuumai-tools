import z from "zod";

import {
  type ChartType,
  musicLevelTable,
  type StdChartDifficulty,
} from "@repo/db-maimai/schema";

import { musicJsonSchema } from "../types.js";

interface LevelProcessResult {
  payload: (typeof musicLevelTable.$inferInsert)[];
  warnings: Array<{
    musicTitle: string;
    chartType: ChartType;
    difficulty: StdChartDifficulty;
    existingLevel: string;
    newLevel: string;
  }>;
  skippedCount: number;
}

export function processMusicLevels(
  newData: z.infer<typeof musicJsonSchema>,
  existingLevels: (typeof musicLevelTable.$inferSelect)[],
  version: string,
): LevelProcessResult {
  const payload: (typeof musicLevelTable.$inferInsert)[] = [];
  const warnings: LevelProcessResult["warnings"] = [];
  let skippedCount = 0;

  // Create a map of existing levels for quick lookup
  const existingLevelsMap = new Map<
    string,
    typeof musicLevelTable.$inferSelect
  >();
  existingLevels.forEach((level) => {
    const key = `${level.musicTitle}:${level.chartType}:${level.difficulty}:${level.version}`;
    existingLevelsMap.set(key, level);
  });

  for (const song of newData) {
    // Process STD charts
    const stdLevels = [
      { difficulty: "basic" as const, level: song.lev_bas },
      { difficulty: "advanced" as const, level: song.lev_adv },
      { difficulty: "expert" as const, level: song.lev_exp },
      { difficulty: "master" as const, level: song.lev_mas },
      { difficulty: "remaster" as const, level: song.lev_remas },
    ];

    for (const { difficulty, level } of stdLevels) {
      if (level) {
        const key = `${song.title}:std:${difficulty}:${version}`;
        const existing = existingLevelsMap.get(key);

        if (existing) {
          if (existing.level !== level) {
            warnings.push({
              musicTitle: song.title,
              chartType: "std",
              difficulty,
              existingLevel: existing.level,
              newLevel: level,
            });
          }
          skippedCount++;
        } else {
          payload.push({
            musicTitle: song.title,
            chartType: "std",
            difficulty,
            level,
            version,
            constant: null,
          });
        }
      }
    }

    // Process DX charts
    const dxLevels = [
      { difficulty: "basic" as const, level: song.dx_lev_bas },
      { difficulty: "advanced" as const, level: song.dx_lev_adv },
      { difficulty: "expert" as const, level: song.dx_lev_exp },
      { difficulty: "master" as const, level: song.dx_lev_mas },
      { difficulty: "remaster" as const, level: song.dx_lev_remas },
    ];

    for (const { difficulty, level } of dxLevels) {
      if (level) {
        const key = `${song.title}:dx:${difficulty}:${version}`;
        const existing = existingLevelsMap.get(key);

        if (existing) {
          if (existing.level !== level) {
            warnings.push({
              musicTitle: song.title,
              chartType: "dx",
              difficulty,
              existingLevel: existing.level,
              newLevel: level,
            });
          }
          skippedCount++;
        } else {
          payload.push({
            musicTitle: song.title,
            chartType: "dx",
            difficulty,
            level,
            version,
            constant: null,
          });
        }
      }
    }
  }

  return {
    payload,
    warnings,
    skippedCount,
  };
}
