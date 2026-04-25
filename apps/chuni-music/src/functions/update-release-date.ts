import z from "zod";

import { musicDataTable } from "@repo/database/chuni";

import { beerSchema } from "../types";

export function updateReleaseDate(
  existingMusicData: (typeof musicDataTable.$inferSelect)[],
  newData: z.infer<typeof beerSchema>[],
) {
  const existingMap = new Map(existingMusicData.map((m) => [m.id, m]));

  const newRecords: Array<{
    songId: number;
    title: string;
    releaseDate: string;
  }> = [];

  const changedRecords: Array<{
    songId: number;
    title: string;
    existingReleaseDate: string;
    newReleaseDate: string;
  }> = [];

  for (const song of newData) {
    if (!song.release_date) {
      continue;
    }

    const existing = existingMap.get(song.id);
    if (!existing) {
      // Song not in DB (might be deleted or not yet added)
      continue;
    }

    if (existing.releaseDate === null) {
      newRecords.push({
        songId: song.id,
        title: song.title,
        releaseDate: song.release_date,
      });
    } else if (existing.releaseDate !== song.release_date) {
      changedRecords.push({
        songId: song.id,
        title: song.title,
        existingReleaseDate: existing.releaseDate,
        newReleaseDate: song.release_date,
      });
    }
  }

  return {
    newRecords,
    changedRecords,
  };
}
