import { error } from "@sveltejs/kit";

import { getMusicDataCached } from "$lib/functions/musicData";
import { getMusicRecord } from "$lib/functions/musicRecord";
import { getDefaultVersion } from "$lib/version";

import type { StdChartDifficulty } from "@repo/types/chuni";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, parent }) => {
  const { session } = await parent();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  const musicId = parseInt(params.musicId, 10);

  if (isNaN(musicId)) {
    error(400, "Invalid music ID");
  }

  // Get music record for the user
  const musicRecord = await getMusicRecord(session.user.id, musicId);

  // Get music data from cache and filter for this specific music
  // Note: getMusicDataCached returns all music, but it's cached in memory
  const musicDataList = await getMusicDataCached(getDefaultVersion());
  const musicData = musicDataList.find((m) => m.id === musicId);

  if (!musicData) {
    error(404, "Music data not found");
  }

  // Sort records by date (recent first) for each difficulty and filter out zero scores
  const sortedRecords: Record<
    StdChartDifficulty,
    (typeof musicRecord.records.basic)[number][]
  > = {
    basic: [],
    advanced: [],
    expert: [],
    master: [],
    ultima: [],
  };

  for (const difficulty of Object.keys(
    musicRecord.records,
  ) as StdChartDifficulty[]) {
    const records = musicRecord.records[difficulty];
    if (records) {
      sortedRecords[difficulty] = [...records]
        .filter((record) => record.score > 0) // Filter out zero scores
        .sort((a, b) => {
          const dateA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
          const dateB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
          return dateB - dateA; // descending order (recent first)
        });
    }
  }

  // Get available difficulties (where user has records after filtering)
  const availableDifficulties: StdChartDifficulty[] = [];
  for (const difficulty of [
    "basic",
    "advanced",
    "expert",
    "master",
    "ultima",
  ] as const) {
    // Show ultima only if music has that difficulty
    if (difficulty === "ultima" && !musicData.ultima) {
      continue;
    }
    if (sortedRecords[difficulty]?.length > 0) {
      availableDifficulties.push(difficulty);
    }
  }

  // Check if there are any records at all
  const hasAnyRecords = availableDifficulties.length > 0;

  return {
    musicRecord,
    musicData,
    sortedRecords,
    availableDifficulties,
    hasAnyRecords,
  };
};
