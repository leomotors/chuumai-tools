import fs from "node:fs/promises";

import { parse } from "csv-parse/sync";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { musicDataTable, musicLevelTable } from "@repo/db-chuni/schema";
import { forInRangeWithProgressBar } from "@repo/utils";

import { db } from "../db";
import { updateMusicConstant as updateMusicConstantLogic } from "../functions/update-music-constant.js";
import { zSchema } from "../types";

export async function updateMusicConstantCsv(
  version: string,
  filePath: string,
) {
  console.log("Step 1: Loading data from CSV file");

  const content = await fs.readFile(filePath, "utf-8");
  const records = (
    parse(content, {
      columns: true,
      skip_empty_lines: true,
    }) as Array<{
      曲名: string;
      譜面: string;
      [version]: string;
    }>
  ).filter((r) => r[version]);

  console.log(`Found ${records.length} records in the CSV file`);

  console.log("\nStep 2: Compare with existing data in the database");
  const existingMusicData = await db.select().from(musicDataTable);
  const existingLevelData = await db.select().from(musicLevelTable);

  // Backward Compat
  const musicData = records.reduce(
    (acc, curr) => {
      const existing = acc.find((a) => a.title === curr.曲名);

      const entry = existing ?? {
        title: curr.曲名,
        sheets: [] as z.infer<typeof zSchema>["songs"][0]["sheets"],
      };

      if (!["ADV", "EXP", "MAS", "ULT"].includes(curr.譜面)) {
        throw new Error(`Unexpected difficulty value: ${curr.譜面}`);
      }

      entry.sheets.push({
        type: "std" as const,
        difficulty:
          curr.譜面 === "ULT"
            ? "ultima"
            : curr.譜面 === "MAS"
              ? "master"
              : curr.譜面 === "EXP"
                ? "expert"
                : "advanced",
        internalLevel: curr[version],
      });

      if (!existing) {
        acc.push(entry);
      }

      return acc;
    },
    [] as z.infer<typeof zSchema>["songs"],
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
