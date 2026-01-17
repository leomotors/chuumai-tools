import fs from "node:fs/promises";

import { eq } from "drizzle-orm";

import { createClient } from "@repo/database/client";
import { manualRatingTable } from "@repo/database/maimai";

import { parseRating } from "../core/parseRating";
import { environment } from "../environment";

export async function insertMaimaiRating() {
  const content = await fs.readFile("./temp/maimai_rating.txt", "utf-8");
  const records = parseRating(content, 17000);

  const db = createClient(environment.MAIMAI_DATABASE_URL);

  const existing = await db
    .select()
    .from(manualRatingTable)
    .where(eq(manualRatingTable.userId, environment.USER_ID));

  const existingTimestamps = new Set(
    existing.map((record) => record.timestamp.getTime()),
  );

  const newRecords = records.filter(
    (record) => !existingTimestamps.has(record.timestamp.getTime()),
  );

  const duplicateRecordsCount = records.length - newRecords.length;
  if (duplicateRecordsCount > 0) {
    console.log(`Skipped ${duplicateRecordsCount} duplicate records.`);
  }

  const recordsToInsert = newRecords.map((record) => ({
    userId: environment.USER_ID,
    rating: record.rating,
    timestamp: record.timestamp,
  }));

  if (recordsToInsert.length > 0) {
    await db.insert(manualRatingTable).values(recordsToInsert);
    console.log(`Inserted ${recordsToInsert.length} new records.`);
  } else {
    console.log("No new records to insert.");
  }

  await db.$client.end();
  process.exit(0);
}
