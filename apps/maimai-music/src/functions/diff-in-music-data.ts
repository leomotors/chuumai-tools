import z from "zod";

import { musicDataTable } from "@repo/database/maimai";

import { musicJsonSchema } from "../types.js";

export function diffInMusicData(
  existingData: (typeof musicDataTable.$inferSelect)[],
  newData: z.infer<typeof musicJsonSchema>,
) {
  const existingDataMap = new Map(existingData.map((m) => [m.title, m]));
  const newDataMap = new Map(newData.map((m) => [m.title, m]));

  const newRecords = newData.filter((m) => !existingDataMap.has(m.title));

  const updatedRecords = newData
    .filter((m) => existingDataMap.has(m.title))
    .map((m) => {
      const existing = existingDataMap.get(m.title)!;
      const changes: Partial<typeof m> = { title: m.title };

      if (existing.category !== m.catcode) changes.catcode = m.catcode;
      if (existing.artist !== m.artist) changes.artist = m.artist;
      if (existing.image !== m.image_url) changes.image_url = m.image_url;

      // Only return if there are actual changes (more than just the title)
      return Object.keys(changes).length > 1 ? changes : null;
    })
    .filter((record): record is NonNullable<typeof record> => record !== null);

  const deletedRecords = existingData.filter((m) => !newDataMap.has(m.title));

  return {
    newRecords,
    updatedRecords,
    deletedRecords,
  };
}
