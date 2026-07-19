import { error } from "@sveltejs/kit";

import {
  getMusicDataCached,
  getMusicLevelHistory,
} from "$lib/functions/musicData";
import { getMusicInfo, getMusicRecord } from "$lib/functions/musicRecord";
import { getPlayHistory } from "$lib/functions/playHistory";
import { getRatingAnalysis } from "$lib/functions/ratingAnalysis";
import { getDefaultVersion, getEnabledVersions } from "$lib/version";

import {
  compressLevelHistory,
  filterContributionIntervalsForChart,
  findMusicDataWithVersionFallback,
  getMusicLookupVersions,
  getOldestToNewestVersions,
  indexSongDurationsByChartKey,
  maimaiRatingChartKey,
  type RatingAnalysisContributionInterval,
  type RatingAnalysisSongDuration,
  type RatingAnalysisTopTimelineSpan,
  topTimelineSpansForChart,
} from "@repo/core/web";
import type { StdChartDifficulty } from "@repo/types/maimai";

import type { PageServerLoad } from "./$types";

type RecordWithKey = Awaited<
  ReturnType<typeof getMusicRecord>
>["records"][number] & {
  key: string;
};
type ChartLevel = { level: string; constant: number | null };
type ChartLevelSnapshot = Record<StdChartDifficulty, ChartLevel | null>;

export type SongRatingTimeline = {
  key: string;
  label: string;
  contributionIntervals: RatingAnalysisContributionInterval[];
  topIntervals: RatingAnalysisTopTimelineSpan[];
  duration: RatingAnalysisSongDuration | null;
};

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const load: PageServerLoad = async ({ params, parent }) => {
  const { session } = await parent();
  const userId = session?.user?.id;
  const isLoggedIn = !!userId;

  const musicTitle = safeDecodeURIComponent(params.musicTitle);

  // Look up in the default version first, falling back to the latest enabled
  // version for songs that only exist there (new songs during a version
  // transition). Each per-version list is cached in memory.
  const musicDataForTitle = await findMusicDataWithVersionFallback(
    getMusicLookupVersions(getDefaultVersion(), getEnabledVersions()),
    getMusicDataCached,
    (m) => m.title === musicTitle,
  );

  if (musicDataForTitle.length === 0) {
    error(404, "Music data not found");
  }

  const musicRecord = isLoggedIn
    ? await getMusicRecord(userId, musicTitle)
    : null;
  const playHistory = isLoggedIn
    ? await getPlayHistory(userId, musicTitle)
    : null;
  const musicInfo = musicRecord?.musicInfo ?? (await getMusicInfo(musicTitle));
  const historyVersions = getOldestToNewestVersions(getEnabledVersions());
  const rawLevelHistory = await getMusicLevelHistory(
    musicTitle,
    historyVersions,
  );
  const levelHistoryByChart = new Map<
    string,
    Map<string, Partial<ChartLevelSnapshot>>
  >();

  for (const item of rawLevelHistory) {
    const chartHistory =
      levelHistoryByChart.get(item.chartType) ??
      new Map<string, Partial<ChartLevelSnapshot>>();
    const versionLevels = chartHistory.get(item.version) ?? {};
    versionLevels[item.difficulty] = {
      level: item.level,
      constant: item.constant,
    };
    chartHistory.set(item.version, versionLevels);
    levelHistoryByChart.set(item.chartType, chartHistory);
  }

  const levelHistory = musicDataForTitle.map((musicData) => {
    const chartHistory = levelHistoryByChart.get(musicData.chartType);

    return {
      chartType: musicData.chartType,
      rows: compressLevelHistory(
        historyVersions
          .map((version) => {
            const versionLevels = chartHistory?.get(version);

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
                remaster: versionLevels.remaster ?? null,
              },
            };
          })
          .filter(
            (item): item is { version: string; data: ChartLevelSnapshot } =>
              Boolean(item),
          ),
      ),
    };
  });

  const groupedRecords: Record<string, RecordWithKey[]> = {};

  // Group records by chartType and difficulty
  if (musicRecord) {
    for (const record of musicRecord.records) {
      const key = `${record.chartType}-${record.difficulty}`;
      if (!groupedRecords[key]) {
        groupedRecords[key] = [];
      }
      groupedRecords[key].push({ ...record, key });
    }
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

  const ratingTimelines: SongRatingTimeline[] = [];
  let ratingComputedAt: string | null = null;

  if (isLoggedIn && userId) {
    const analysis = await getRatingAnalysis(userId);
    ratingComputedAt = analysis.computedAt;
    const durationsByChartKey = indexSongDurationsByChartKey(
      analysis.songDurations,
    );

    for (const musicData of musicDataForTitle) {
      for (const difficulty of [
        "basic",
        "advanced",
        "expert",
        "master",
        "remaster",
      ] as const) {
        if (!musicData[difficulty]) continue;

        const tabKey = `${musicData.chartType}-${difficulty}`;
        const chartKey = maimaiRatingChartKey(
          musicTitle,
          musicData.chartType,
          difficulty,
        );
        const contributionIntervals = filterContributionIntervalsForChart(
          analysis.contributionIntervals,
          chartKey,
        );
        const topIntervals = topTimelineSpansForChart(
          analysis.highestTimeline,
          chartKey,
        );
        const duration = durationsByChartKey.get(chartKey) ?? null;

        if (
          contributionIntervals.length === 0 &&
          topIntervals.length === 0 &&
          !duration
        ) {
          continue;
        }

        ratingTimelines.push({
          key: tabKey,
          label: `${musicData.chartType.toUpperCase()} · ${
            difficulty === "remaster"
              ? "Re:MASTER"
              : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
          }`,
          contributionIntervals,
          topIntervals,
          duration,
        });
      }
    }
  }

  return {
    musicInfo,
    musicDataForTitle,
    sortedRecords,
    availableCharts,
    hasAnyRecords,
    levelHistory,
    playHistory,
    ratingTimelines,
    ratingComputedAt,
    isLoggedIn,
  };
};
