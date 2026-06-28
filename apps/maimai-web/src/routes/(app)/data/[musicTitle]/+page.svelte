<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";
  import { SvelteSet } from "svelte/reactivity";

  import { getVersionNameMapping } from "$lib/constants";

  import { difficultyColorMap, getDXStar, getRank } from "@repo/core/maimai";
  import { buildImprovementTimeline } from "@repo/core/web";
  import { ranks, type StdChartDifficulty } from "@repo/types/maimai";
  import { Button } from "@repo/ui/atom/button";
  import * as Table from "@repo/ui/atom/table";
  import * as Tabs from "@repo/ui/atom/tabs";
  import Discord from "@repo/ui/icons/Discord.svelte";
  import { RatingListTimelinePanel } from "@repo/ui/molecule/RatingListTimelinePanel";
  import { signInAgreementNotice } from "@repo/ui/utils";

  let { data } = $props();

  const musicInfo = $derived(data.musicInfo);
  const musicDataForTitle = $derived(data.musicDataForTitle);
  const sortedRecords = $derived(data.sortedRecords);
  const availableCharts = $derived(data.availableCharts);
  const hasAnyRecords = $derived(data.hasAnyRecords);
  const isLoggedIn = $derived(data.isLoggedIn);
  const levelHistory = $derived(data.levelHistory);
  const playHistory = $derived(data.playHistory);
  const ratingTimelines = $derived(data.ratingTimelines);
  const ratingComputedAt = $derived(data.ratingComputedAt);
  let selectedRatingChart = $state("");
  const expandedHistoryGroups = new SvelteSet<string>();
  const historyDifficulties = [
    "basic",
    "advanced",
    "expert",
    "master",
    "remaster",
  ] as const;

  // Default selected tab is the first available chart
  let selectedChart = $state<string>("");

  $effect(() => {
    if (
      ratingTimelines.length > 0 &&
      !ratingTimelines.some((timeline) => timeline.key === selectedRatingChart)
    ) {
      selectedRatingChart = ratingTimelines[0].key;
    }
  });

  // Update selectedChart when availableCharts changes
  $effect(() => {
    if (
      availableCharts.length > 0 &&
      !availableCharts.some((chart) => chart.key === selectedChart)
    ) {
      selectedChart = availableCharts[0].key;
    }
  });

  function formatDate(date: Date | null) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatShortDate(date: Date | null) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function getComboMarkImage(comboMark: string | null) {
    if (!comboMark || comboMark === "NONE") return "/playmark/fc_dummy.png";
    return `/playmark/${comboMark.toLowerCase().replace("+", "p")}.png`;
  }

  function getSyncMarkImage(syncMark: string | null) {
    if (!syncMark || syncMark === "NONE") return "/playmark/sync_dummy.png";
    return `/playmark/${syncMark.toLowerCase().replace("+", "p")}.png`;
  }

  function getRankImage(score: number) {
    const rank = ranks[getRank(score)] || "D";
    return `/rankmark/${rank.toLowerCase().replace("+", "p")}.png`;
  }

  function getDXStarImage(dxScore: number, dxScoreMax: number) {
    const star = getDXStar(dxScore, dxScoreMax);
    return star ? `/dxstar/${star}.png` : null;
  }

  function capitalizeDifficulty(diff: string) {
    if (diff === "remaster") return "Re:MASTER";
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  }

  function capitalizeChartType(type: string) {
    return type.toUpperCase();
  }

  // Check if should show constant (show for all except Basic with level ≤ 7)
  function shouldShowConstant(
    difficulty: StdChartDifficulty,
    constant: number | null,
  ) {
    if (!constant) return false;
    if (difficulty === "basic" && constant <= 7) return false;
    return true;
  }

  function formatLevel(
    difficulty: StdChartDifficulty,
    chart: { level: string; constant: number | null } | null,
  ) {
    if (!chart) return "-";
    return shouldShowConstant(difficulty, chart.constant)
      ? `${chart.level} (${chart.constant?.toFixed(1)})`
      : chart.level;
  }

  function formatVersionRange(fromVersion: string, toVersion: string) {
    if (fromVersion === toVersion) {
      return getVersionNameMapping(fromVersion);
    }

    return `${getVersionNameMapping(fromVersion)} ~ ${getVersionNameMapping(
      toVersion,
    )}`;
  }

  function getHistoryRecords(chartKey: string) {
    return (
      playHistory?.records.filter(
        (record) => `${record.chartType}-${record.difficulty}` === chartKey,
      ) ?? []
    );
  }

  const recordTimelines = $derived.by(() =>
    Object.fromEntries(
      availableCharts.map((chart) => [
        chart.key,
        buildImprovementTimeline({
          improvements: sortedRecords[chart.key] ?? [],
          historyRecords: getHistoryRecords(chart.key),
          getImprovementTime: (record) => record.lastPlayed,
          getHistoryTime: (record) => record.playedAt,
          isSamePlay: (record, historyRecord) =>
            record.score === historyRecord.score &&
            record.dxScore === historyRecord.dxScore &&
            record.dxScoreMax === historyRecord.dxScoreMax &&
            record.comboMark === historyRecord.comboMark &&
            record.syncMark === historyRecord.syncMark,
          getId: (_record, index) => `${chart.key}-${index}`,
        }),
      ]),
    ),
  );

  function isHistoryGroupExpanded(groupId: string) {
    return expandedHistoryGroups.has(groupId);
  }

  function setHistoryGroupExpanded(groupId: string, expanded: boolean) {
    if (expanded) {
      expandedHistoryGroups.add(groupId);
    } else {
      expandedHistoryGroups.delete(groupId);
    }
  }

  function expandCurrentChart() {
    expandedHistoryGroups.clear();
    for (const id of [
      recordTimelines[selectedChart]?.topHistoryRecords.length > 0
        ? `${selectedChart}-top`
        : null,
      ...(recordTimelines[selectedChart]?.entries ?? [])
        .filter((entry) => entry.historyRecords.length > 0)
        .map((entry) => entry.id),
    ].filter((id): id is string => id !== null)) {
      expandedHistoryGroups.add(id);
    }
  }

  function collapseAllHistory() {
    expandedHistoryGroups.clear();
  }
</script>

<div class="mx-auto max-w-6xl w-full space-y-6">
  <!-- Navigation Buttons -->
  <div class="flex gap-3">
    {#if isLoggedIn}
      <a
        href="/dashboard"
        class="px-3 py-1.5 text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-colors duration-200"
      >
        ← Dashboard
      </a>
    {/if}
    <a
      href="/data"
      class="px-3 py-1.5 text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-colors duration-200"
    >
      ← All Music Data
    </a>
  </div>

  <!-- Music Info Card -->
  <div
    class="rounded-xl border border-gray-200/50 bg-white/70 p-4 sm:p-6 shadow-lg backdrop-blur-md"
  >
    <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
      <img
        src="/api/imageProxy?img={musicInfo.image}"
        alt={musicInfo.title}
        class="size-32 rounded-lg object-cover mx-auto sm:mx-0 flex-shrink-0"
      />
      <div class="flex-1 space-y-2 text-center sm:text-left">
        <h1 class="text-2xl font-bold text-gray-800">
          {musicInfo.title}
        </h1>
        <p class="text-lg text-gray-600">{musicInfo.artist}</p>
        <div
          class="flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1 text-sm text-gray-500"
        >
          <span>Category: {musicInfo.category}</span>
          <span>•</span>
          <span>Version: {musicInfo.version}</span>
        </div>

        <!-- Chart Levels for each chart type -->
        <div class="space-y-2 mt-3">
          {#each musicDataForTitle as musicData (musicData.chartType)}
            <div>
              <img
                src="/charttype/{musicData.chartType}.png"
                alt={musicData.chartType}
                class="inline-block h-5 mb-1"
              />
              <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                {#each ["basic", "advanced", "expert", "master", "remaster"] as difficulty (difficulty)}
                  {@const diff = difficulty as StdChartDifficulty}
                  {#if musicData[diff]}
                    <div
                      class="px-2 sm:px-3 py-1 rounded-md text-white text-xs sm:text-sm font-semibold {difficultyColorMap[
                        diff
                      ]}"
                    >
                      {capitalizeDifficulty(difficulty)}: {musicData[diff]
                        .level}
                      {#if shouldShowConstant(diff, musicData[diff].constant)}
                        ({musicData[diff].constant?.toFixed(1)})
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Level History Section -->
  <div
    class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
  >
    <h2 class="text-xl font-bold text-gray-800 mb-4">Level History</h2>

    {#if levelHistory.every((history) => history.rows.length === 0)}
      <div class="py-8 text-center text-gray-500">No level history found</div>
    {:else}
      <div class="space-y-6">
        {#each levelHistory as history (history.chartType)}
          {#if history.rows.length > 0}
            <div class="space-y-3">
              <img
                src="/charttype/{history.chartType}.png"
                alt={history.chartType}
                class="h-5"
              />
              <div class="overflow-x-auto">
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="text-gray-900">Version</Table.Head>
                      {#each historyDifficulties as difficulty (difficulty)}
                        <Table.Head class="text-center text-gray-900">
                          {capitalizeDifficulty(difficulty)}
                        </Table.Head>
                      {/each}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each history.rows as row (`${history.chartType}-${row.fromVersion}-${row.toVersion}`)}
                      <Table.Row>
                        <Table.Cell class="font-medium text-gray-900">
                          {formatVersionRange(row.fromVersion, row.toVersion)}
                        </Table.Cell>
                        {#each historyDifficulties as difficulty (difficulty)}
                          <Table.Cell class="text-center text-gray-700">
                            {formatLevel(difficulty, row.data[difficulty])}
                          </Table.Cell>
                        {/each}
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <!-- Records Section -->
  <div
    class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
  >
    <div
      class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold text-gray-800">Play Records</h2>
          <span
            class="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
          >
            Beta
          </span>
        </div>
        {#if isLoggedIn && playHistory?.earliestPlayedAt}
          <p class="mt-1 text-xs text-gray-500">
            History play count since {formatShortDate(
              playHistory.earliestPlayedAt,
            )} only.
          </p>
        {/if}
      </div>
      {#if isLoggedIn}
        <div class="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onclick={expandCurrentChart}
            class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:flex-none"
          >
            Expand All
          </button>
          <button
            type="button"
            onclick={collapseAllHistory}
            class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:flex-none"
          >
            Collapse All
          </button>
        </div>
      {/if}
    </div>

    {#if !isLoggedIn}
      <div class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="text-center space-y-2">
          <p class="text-xl font-semibold text-gray-700">
            Sign in to view Play Records
          </p>
          <p class="text-gray-500">
            Your play history for this song will appear here after signing in.
          </p>
        </div>
        <Button
          onclick={() => signIn("discord")}
          class="bg-[#5865f2] text-white hover:bg-[#4752c4]"
        >
          Sign in with
          <Discord class="size-5" />
        </Button>
        <p class="max-w-sm text-center text-xs text-gray-500">
          {signInAgreementNotice}
        </p>
      </div>
    {:else if !hasAnyRecords}
      <div class="flex flex-col items-center justify-center py-12 space-y-4">
        <svg
          class="size-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
        <div class="text-center space-y-2">
          <p class="text-xl font-semibold text-gray-700">
            No Play Records Found
          </p>
          <p class="text-gray-500">
            You haven't played this song yet. Start playing to see your records
            here!
          </p>
        </div>
      </div>
    {:else}
      <Tabs.Root bind:value={selectedChart}>
        <Tabs.List class="flex w-full gap-1 overflow-x-auto">
          {#each availableCharts as chart (chart.key)}
            <Tabs.Trigger value={chart.key} class="min-w-max">
              {capitalizeChartType(chart.chartType)} - {capitalizeDifficulty(
                chart.difficulty,
              )}
              <span class="text-xs opacity-70">
                ({playHistory?.playCounts[chart.key] ?? 0})
              </span>
            </Tabs.Trigger>
          {/each}
        </Tabs.List>

        {#each availableCharts as chart (chart.key)}
          <Tabs.Content value={chart.key}>
            {@const timeline = recordTimelines[chart.key]}
            {#if timeline.entries.length > 0}
              <div class="mt-4 space-y-3">
                {#if timeline.topHistoryRecords.length > 0}
                  {@const topGroupId = `${chart.key}-top`}
                  <div
                    class="rounded-lg border border-dashed border-gray-300 bg-white/50"
                  >
                    <button
                      type="button"
                      onclick={() =>
                        setHistoryGroupExpanded(
                          topGroupId,
                          !isHistoryGroupExpanded(topGroupId),
                        )}
                      class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100/70"
                    >
                      <span>
                        {isHistoryGroupExpanded(topGroupId)
                          ? "Collapse"
                          : "Expand"}
                        {timeline.topHistoryRecords.length} recent records
                      </span>
                      <span class="text-xs text-gray-500">
                        after latest improvement
                      </span>
                    </button>
                    {#if isHistoryGroupExpanded(topGroupId)}
                      <div class="space-y-2 border-t border-gray-200 p-3">
                        {#each timeline.topHistoryRecords as historyRecord (`${historyRecord.playedAt}-${historyRecord.trackNo}-${historyRecord.score}`)}
                          <div
                            class="flex flex-col gap-3 rounded-md bg-gray-50/80 p-3 sm:flex-row sm:items-center"
                          >
                            <div class="flex-1">
                              <div class="font-medium text-gray-900">
                                {formatDate(historyRecord.playedAt)}
                              </div>
                              <div class="text-sm text-gray-500">
                                Track {historyRecord.trackNo}
                              </div>
                            </div>
                            <div
                              class="flex flex-col items-start gap-2 sm:items-end"
                            >
                              <div class="flex gap-2 items-center">
                                <img
                                  src={getRankImage(historyRecord.score)}
                                  alt={ranks[getRank(historyRecord.score)]}
                                  class="w-16"
                                />
                                <p class="font-bold text-gray-800">
                                  {(historyRecord.score / 10000).toFixed(4)}%
                                </p>
                              </div>
                              <div
                                class="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <span>
                                  DX Score: {historyRecord.dxScore.toLocaleString()}
                                  / {historyRecord.dxScoreMax.toLocaleString()}
                                </span>
                                {#if getDXStarImage(historyRecord.dxScore, historyRecord.dxScoreMax)}
                                  <img
                                    src={getDXStarImage(
                                      historyRecord.dxScore,
                                      historyRecord.dxScoreMax,
                                    )}
                                    alt="DX Star"
                                    class="w-5 h-5 sm:w-6 sm:h-6"
                                  />
                                {/if}
                              </div>
                              <div
                                class="flex flex-wrap items-center gap-1 sm:justify-end"
                              >
                                <img
                                  src={getComboMarkImage(
                                    historyRecord.comboMark,
                                  )}
                                  alt={historyRecord.comboMark}
                                  class="w-14"
                                />
                                <img
                                  src={getSyncMarkImage(historyRecord.syncMark)}
                                  alt={historyRecord.syncMark}
                                  class="w-14"
                                />
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
                {#each timeline.entries as entry (entry.id)}
                  {@const record = entry.improvement}
                  <div
                    class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50/50"
                  >
                    <div class="flex-1">
                      <div
                        class="text-lg sm:text-xl font-semibold text-gray-900"
                      >
                        {formatDate(entry.displayDate)}
                      </div>
                      {#if entry.matchedHistory}
                        <div class="text-sm text-gray-500">
                          Track {entry.matchedHistory.trackNo}
                        </div>
                      {/if}
                    </div>

                    <div
                      class="flex flex-col items-start gap-2 w-full sm:w-auto sm:items-end"
                    >
                      <div class="flex gap-2 items-center">
                        <img
                          src={getRankImage(record.score)}
                          alt={ranks[getRank(record.score)]}
                          class="w-16"
                        />

                        <p class="text-xl sm:text-2xl font-bold text-gray-800">
                          {(record.score / 10000).toFixed(4)}%
                        </p>
                      </div>

                      <div
                        class="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span>
                          DX Score: {record.dxScore.toLocaleString()} / {record.dxScoreMax.toLocaleString()}
                        </span>
                        {#if getDXStarImage(record.dxScore, record.dxScoreMax)}
                          <img
                            src={getDXStarImage(
                              record.dxScore,
                              record.dxScoreMax,
                            )}
                            alt="DX Star"
                            class="w-5 h-5 sm:w-6 sm:h-6"
                          />
                        {/if}
                      </div>

                      <div
                        class="flex items-center gap-1 sm:gap-2 flex-wrap justify-end"
                      >
                        <img
                          src={getComboMarkImage(record.comboMark)}
                          alt={record.comboMark}
                          class="w-14"
                        />

                        <img
                          src={getSyncMarkImage(record.syncMark)}
                          alt={record.syncMark}
                          class="w-14"
                        />
                      </div>
                    </div>
                  </div>
                  {#if entry.historyRecords.length > 0}
                    <div
                      class="rounded-lg border border-dashed border-gray-300 bg-white/50"
                    >
                      <button
                        type="button"
                        onclick={() =>
                          setHistoryGroupExpanded(
                            entry.id,
                            !isHistoryGroupExpanded(entry.id),
                          )}
                        class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100/70"
                      >
                        <span>
                          {isHistoryGroupExpanded(entry.id)
                            ? "Collapse"
                            : "Expand"}
                          {entry.historyRecords.length} records
                        </span>
                        <span class="text-xs text-gray-500">
                          scraper history
                        </span>
                      </button>
                      {#if isHistoryGroupExpanded(entry.id)}
                        <div class="space-y-2 border-t border-gray-200 p-3">
                          {#each entry.historyRecords as historyRecord (`${historyRecord.playedAt}-${historyRecord.trackNo}-${historyRecord.score}`)}
                            <div
                              class="flex flex-col gap-3 rounded-md bg-gray-50/80 p-3 sm:flex-row sm:items-center"
                            >
                              <div class="flex-1">
                                <div class="font-medium text-gray-900">
                                  {formatDate(historyRecord.playedAt)}
                                </div>
                                <div class="text-sm text-gray-500">
                                  Track {historyRecord.trackNo}
                                </div>
                              </div>
                              <div
                                class="flex flex-col items-start gap-2 sm:items-end"
                              >
                                <div class="flex gap-2 items-center">
                                  <img
                                    src={getRankImage(historyRecord.score)}
                                    alt={ranks[getRank(historyRecord.score)]}
                                    class="w-16"
                                  />
                                  <p class="font-bold text-gray-800">
                                    {(historyRecord.score / 10000).toFixed(4)}%
                                  </p>
                                </div>
                                <div
                                  class="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <span>
                                    DX Score: {historyRecord.dxScore.toLocaleString()}
                                    / {historyRecord.dxScoreMax.toLocaleString()}
                                  </span>
                                  {#if getDXStarImage(historyRecord.dxScore, historyRecord.dxScoreMax)}
                                    <img
                                      src={getDXStarImage(
                                        historyRecord.dxScore,
                                        historyRecord.dxScoreMax,
                                      )}
                                      alt="DX Star"
                                      class="w-5 h-5 sm:w-6 sm:h-6"
                                    />
                                  {/if}
                                </div>
                                <div
                                  class="flex flex-wrap items-center gap-1 sm:justify-end"
                                >
                                  <img
                                    src={getComboMarkImage(
                                      historyRecord.comboMark,
                                    )}
                                    alt={historyRecord.comboMark}
                                    class="w-14"
                                  />
                                  <img
                                    src={getSyncMarkImage(
                                      historyRecord.syncMark,
                                    )}
                                    alt={historyRecord.syncMark}
                                    class="w-14"
                                  />
                                </div>
                              </div>
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            {:else}
              <div class="mt-4 text-center text-gray-500 py-8">
                No records found for this chart
              </div>
            {/if}
          </Tabs.Content>
        {/each}
      </Tabs.Root>
    {/if}

    <!-- Footer Note -->
    <div class="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
      <p>
        Note: The accuracy of the data is based on how often you upload the data
        (run the scraper), for such limitation, score improvement within same
        credit will not be show.
      </p>
    </div>
  </div>

  {#if isLoggedIn}
    <div
      class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
    >
      <h2 class="text-xl font-bold text-gray-800">Music for Rating</h2>
      <p class="mt-1 text-xs text-gray-500">
        Time on your rating list between scraper uploads. Score changes within a
        stint are grouped into one period.
      </p>

      {#if ratingTimelines.length === 0}
        <p class="py-8 text-center text-sm text-gray-500">
          No Music for Rating history for this song yet.
        </p>
      {:else if ratingComputedAt}
        <div class="mt-4">
          <Tabs.Root bind:value={selectedRatingChart}>
            <Tabs.List class="mb-4 flex w-full gap-1 overflow-x-auto">
              {#each ratingTimelines as timeline (timeline.key)}
                <Tabs.Trigger value={timeline.key} class="min-w-max">
                  {timeline.label}
                </Tabs.Trigger>
              {/each}
            </Tabs.List>

            {#each ratingTimelines as timeline (timeline.key)}
              <Tabs.Content value={timeline.key}>
                <RatingListTimelinePanel
                  contributionIntervals={timeline.contributionIntervals}
                  topIntervals={timeline.topIntervals}
                  computedAt={ratingComputedAt}
                  poolLabels={{ old: "OLD", new: "NEW" }}
                  isCurrentTop={timeline.duration?.isCurrentTop ?? false}
                  isCurrentContributor={timeline.duration
                    ?.isCurrentContributor ?? false}
                />
              </Tabs.Content>
            {/each}
          </Tabs.Root>
        </div>
      {/if}
    </div>
  {/if}
</div>
