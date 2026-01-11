import { and, eq } from "drizzle-orm";

import { forInRangeWithProgressBar } from "@repo/core";
import { mapMaimaiTitleWithCategory } from "@repo/core/maimai";
import { musicDataTable, musicLevelTable } from "@repo/database/maimai";
import { Category, StdChartDifficulty } from "@repo/types/maimai";

import { db } from "../db";
import { updateMusicConstant as updateMusicConstantLogic } from "../functions/update-music-constant.js";
import { qmanJsonSchema } from "../types";

const url = "https://reiwa.f5.si/maimai_record.json";

export async function updateMusicConstantQman(version: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch music data");
  }
  const data = qmanJsonSchema.parse(await response.json()).map((m) => ({
    ...m,
    title: mapMaimaiTitleWithCategory(m.title, m.genre),
  }));

  const existingMusicData = await db.select().from(musicDataTable);
  const existingLevelData = await db.select().from(musicLevelTable);

  // Convert qman data to musicData format
  const musicData = Object.values(
    data
      .filter((c) => !c.is_unknown)
      .reduce(
        (acc, entry) => {
          const key = entry.title;
          if (!acc[key]) {
            acc[key] = {
              title: entry.title,
              category: entry.genre,
              sheets: [],
            };
          }
          acc[key].sheets.push({
            type: entry.is_dx ? "dx" : "std",
            difficulty: entry.diff,
            internalLevel: entry.const.toFixed(1),
          });
          return acc;
        },
        {} as Record<
          string,
          {
            title: string;
            category: Category;
            sheets: Array<{
              type: "std" | "dx";
              difficulty: StdChartDifficulty;
              internalLevel: string;
            }>;
          }
        >,
      ),
  );

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

  // Dry run
  if (process.env.DRY_RUN) {
    console.log("Dry Run enabled - no database updates will be applied");
    console.log(result.payload);
    return;
  }

  // Apply the database updates
  await forInRangeWithProgressBar(
    result.payload,
    async (update) =>
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
        ),
  );

  console.log(
    `UpdateMusicConstant: Applied ${result.payload.length} updates, found ${result.nullsCount} nulls, you will have to manually update from other source`,
  );

  if (result.nullsTitle.length > 0) {
    console.log(
      `Songs with null constants (Update from other source required): ${result.nullsTitle.slice(0, 10).join(", ")}`,
    );
  }
}
