import { PgInsertValue } from "drizzle-orm/pg-core";
import z from "zod";

import { musicLevelTable } from "@repo/database/chuni";

import type { musicJsonSchema } from "../types.js";

export type ProcessMusicLevelsResult = {
  payload: PgInsertValue<typeof musicLevelTable>[];
  warnings: Array<{
    musicId: number;
    difficulty: string;
    existingLevel: string;
    newLevel: string;
  }>;
  skippedCount: number;
};

export function processMusicLevels(
  newMusicData: z.infer<typeof musicJsonSchema>,
  existingChartLevel: (typeof musicLevelTable.$inferSelect)[],
  version: string,
): ProcessMusicLevelsResult {
  const payload = [] as PgInsertValue<typeof musicLevelTable>[];
  const warnings: ProcessMusicLevelsResult["warnings"] = [];

  for (const music of newMusicData) {
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

  const filteredPayload = [] as PgInsertValue<typeof musicLevelTable>[];

  // Check for level mismatches
  let skippedCount = 0;
  for (const p of payload) {
    const result = existingChartLevel.find(
      (c) =>
        c.musicId === p.musicId &&
        c.difficulty === p.difficulty &&
        c.version === version,
    );
    if (result) {
      if (result.level !== p.level) {
        warnings.push({
          musicId: p.musicId as number,
          difficulty: p.difficulty as string,
          existingLevel: result.level,
          newLevel: p.level as string,
        });
      } else {
        // Already Exists with same level, skip
      }

      skippedCount++;
    } else {
      // Insert new
      filteredPayload.push(p);
    }
  }

  return { payload: filteredPayload, warnings, skippedCount };
}
