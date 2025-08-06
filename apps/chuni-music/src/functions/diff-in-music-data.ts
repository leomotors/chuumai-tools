import z from "zod";

import { musicDataTable } from "@repo/db-chuni/schema";

import { musicJsonSchema } from "../types";

export function diffInMusicData(
  existingData: (typeof musicDataTable.$inferSelect)[],
  newData: z.infer<typeof musicJsonSchema>,
) {
  const existingDataMap = new Map(existingData.map((m) => [m.id, m]));
  const newDataMap = new Map(newData.map((m) => [m.id, m]));

  const newRecords = newData.filter((m) => !existingDataMap.has(m.id));

  const updatedRecords = newData
    .filter((m) => existingDataMap.has(m.id))
    .map((m) => {
      const existing = existingDataMap.get(m.id)!;
      const changes: Partial<typeof m> = { id: m.id };

      if (existing.category !== m.catname) changes.catname = m.catname;
      if (existing.title !== m.title) changes.title = m.title;
      if (existing.artist !== m.artist) changes.artist = m.artist;
      if (existing.image !== m.image) changes.image = m.image;

      // Only return if there are actual changes (more than just the id)
      return Object.keys(changes).length > 1 ? changes : null;
    })
    .filter((record): record is NonNullable<typeof record> => record !== null);

  const removedRecords = existingData.filter((m) => !newDataMap.has(m.id));

  return {
    newRecords,
    updatedRecords,
    removedRecords,
  };
}
