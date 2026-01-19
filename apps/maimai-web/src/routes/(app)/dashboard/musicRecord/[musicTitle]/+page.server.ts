import { error } from "@sveltejs/kit";

import { getMusicDataCached } from "$lib/functions/musicData";
import { getMusicRecord } from "$lib/functions/musicRecord";
import { getDefaultVersion } from "$lib/version";

import type { StdChartDifficulty } from "@repo/types/maimai";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, parent }) => {
  const { session } = await parent();

  if (!session?.user?.id) {
    error(401, "Unauthorized");
  }

  const musicTitle = decodeURIComponent(params.musicTitle);

  // Get music record for the user
  const musicRecord = await getMusicRecord(session.user.id, musicTitle);

  // Get music data from cache and filter for this specific music
  // Note: getMusicDataCached returns all music, but it's cached in memory
  const musicDataList = await getMusicDataCached(getDefaultVersion());
  const musicDataForTitle = musicDataList.filter((m) => m.title === musicTitle);

  if (musicDataForTitle.length === 0) {
    error(404, "Music data not found");
  }

  // Group records by chartType and difficulty
  type RecordWithKey = (typeof musicRecord.records)[number] & {
    key: string;
  };

  const groupedRecords: Record<string, RecordWithKey[]> = {};

  for (const record of musicRecord.records) {
    const key = `${record.chartType}-${record.difficulty}`;
    if (!groupedRecords[key]) {
      groupedRecords[key] = [];
    }
    groupedRecords[key].push({ ...record, key });
  }

  // Sort records by date (recent first) and filter out zero scores for each group
  const sortedRecords: Record<string, RecordWithKey[]> = {};
  for (const [key, records] of Object.entries(groupedRecords)) {
    sortedRecords[key] = [...records]
      .filter((record) => record.score > 0) // Filter out zero scores
      .sort((a, b) => {
        const dateA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
        const dateB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
        return dateB - dateA; // descending order (recent first)
      });
  }

  // Get available chart types and difficulties
  const availableCharts: Array<{
    chartType: string;
    difficulty: StdChartDifficulty;
    key: string;
  }> = [];

  for (const musicData of musicDataForTitle) {
    for (const difficulty of [
      "basic",
      "advanced",
      "expert",
      "master",
      "remaster",
    ] as const) {
      if (musicData[difficulty]) {
        const key = `${musicData.chartType}-${difficulty}`;
        if (sortedRecords[key]?.length > 0) {
          availableCharts.push({
            chartType: musicData.chartType,
            difficulty,
            key,
          });
        }
      }
    }
  }

  // Check if there are any records at all
  const hasAnyRecords = availableCharts.length > 0;

  return {
    musicRecord,
    musicDataForTitle,
    sortedRecords,
    availableCharts,
    hasAnyRecords,
  };
};
