import { error } from "@sveltejs/kit";

import {
  getMusicDataCached,
  getMusicLevelHistory,
} from "$lib/functions/musicData";
import { getMusicInfo, getMusicRecord } from "$lib/functions/musicRecord";
import { getPlayHistory } from "$lib/functions/playHistory";
import { getDefaultVersion, getEnabledVersions } from "$lib/version";

import {
  compressLevelHistory,
  getOldestToNewestVersions,
} from "@repo/core/web";
import type { StdChartDifficulty } from "@repo/types/chuni";

import type { PageServerLoad } from "./$types";

type MusicRecordItem = Awaited<
  ReturnType<typeof getMusicRecord>
>["records"]["basic"][number];
type ChartLevel = { level: string; constant: number | null };
type ChartLevelSnapshot = Record<StdChartDifficulty, ChartLevel | null>;

export const load: PageServerLoad = async ({ params, parent }) => {
  const { session } = await parent();
  const userId = session?.user?.id;
  const isLoggedIn = !!userId;

  const musicId = parseInt(params.musicId, 10);

  if (isNaN(musicId)) {
    error(400, "Invalid music ID");
  }

  // Get music data from cache and filter for this specific music
  // Note: getMusicDataCached returns all music, but it's cached in memory
  const musicDataList = await getMusicDataCached(getDefaultVersion());
  const musicData = musicDataList.find((m) => m.id === musicId);

  if (!musicData) {
    error(404, "Music data not found");
  }

  const musicRecord = isLoggedIn ? await getMusicRecord(userId, musicId) : null;
  const playHistory = isLoggedIn ? await getPlayHistory(userId, musicId) : null;
  const musicInfo = musicRecord?.musicInfo ?? (await getMusicInfo(musicId));
  const historyVersions = getOldestToNewestVersions(getEnabledVersions());
  const rawLevelHistory = await getMusicLevelHistory(musicId, historyVersions);
  const levelHistoryByVersion = new Map<string, Partial<ChartLevelSnapshot>>();

  for (const item of rawLevelHistory) {
    const versionLevels = levelHistoryByVersion.get(item.version) ?? {};
    versionLevels[item.difficulty] = {
      level: item.level,
      constant: item.constant,
    };
    levelHistoryByVersion.set(item.version, versionLevels);
  }

  const levelHistory = compressLevelHistory(
    historyVersions
      .map((version) => {
        const versionLevels = levelHistoryByVersion.get(version);

        if (!versionLevels) {
          return null;
        }

        return {
          version,
          data: {
            basic: versionLevels.basic ?? null,
            advanced: versionLevels.advanced ?? null,
            expert: versionLevels.expert ?? null,
            master: versionLevels.master ?? null,
            ultima: versionLevels.ultima ?? null,
          },
        };
      })
      .filter((item): item is { version: string; data: ChartLevelSnapshot } =>
        Boolean(item),
      ),
  );

  // Sort records by date (recent first) for each difficulty and filter out zero scores
  const sortedRecords: Record<StdChartDifficulty, MusicRecordItem[]> = {
    basic: [],
    advanced: [],
    expert: [],
    master: [],
    ultima: [],
  };

  if (musicRecord) {
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
    musicInfo,
    musicData,
    sortedRecords,
    availableDifficulties,
    hasAnyRecords,
    levelHistory,
    playHistory,
    isLoggedIn,
  };
};
