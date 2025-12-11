import fs from "node:fs/promises";

import { and, eq } from "drizzle-orm";
import z from "zod";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";
import { forInRangeWithProgressBar } from "@repo/utils";

import { db } from "../db";
import { updateMusicConstant as updateMusicConstantLogic } from "../functions/update-music-constant.js";
import { beerSchema, diffMapping, ThreeAlphaDiff, zSchema } from "../types";

// wget https://chunithm.beerpsi.cc/songs -O temp/songs-beer.json

export async function updateMusicConstantBeer(version: string) {
  console.log("Step 1: Loading chart constant data");

  const content = await fs.readFile("temp/songs-beer.json", "utf-8");
  const data = z.array(beerSchema).parse(JSON.parse(content));

  // Backward Compat
  const musicData = data.map((song) => ({
    title: song.title,
    sheets: song.charts
      .filter((chart) => chart.difficulty !== "WE" && chart.const)
      .map((chart) => ({
        type: "std" as const,
        difficulty: diffMapping[chart.difficulty as ThreeAlphaDiff],
        internalLevel: chart.const!.toFixed(1),
      })),
  })) satisfies z.infer<typeof zSchema>["songs"];

  console.log("\nStep 2: Compare with existing data in the database");
  const existingMusicData = await db.select().from(musicDataTable);
  const existingLevelData = await db.select().from(musicLevelTable);

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

  console.log(`\nStep 3: Applying updates to the database`);
  // Apply the database updates
  await forInRangeWithProgressBar(result.payload, async (update) => {
    await db
      .update(musicLevelTable)
      .set({ constant: update.newConstant })
      .where(
        and(
          eq(musicLevelTable.musicId, update.songId),
          eq(musicLevelTable.difficulty, update.difficulty),
          eq(musicLevelTable.version, update.version),
        ),
      );
  });

  console.log(
    `UpdateMusicConstant: Applied ${result.payload.length} updates, found ${result.nullsCount} nulls`,
  );

  if (result.nullsTitle.length > 0) {
    console.log(
      `Songs with null constants (Update from other source required): ${result.nullsTitle.join(", ")}`,
    );
  }
}
