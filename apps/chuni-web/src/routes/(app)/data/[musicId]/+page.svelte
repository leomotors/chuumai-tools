<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";
  import { ExternalLink } from "@lucide/svelte";
  import { SvelteSet } from "svelte/reactivity";

  import { getVersionNameMapping } from "$lib/constants";

  import { difficultyColorMap, getLamp, getRank } from "@repo/core/chuni";
  import { buildImprovementTimeline } from "@repo/core/web";
  import { ranks, type StdChartDifficulty } from "@repo/types/chuni";
  import { Button } from "@repo/ui/atom/button";
  import * as Table from "@repo/ui/atom/table";
  import * as Tabs from "@repo/ui/atom/tabs";
  import Discord from "@repo/ui/icons/Discord.svelte";
  import { signInAgreementNotice } from "@repo/ui/utils";

  let { data } = $props();

  const musicInfo = $derived(data.musicInfo);
  const musicData = $derived(data.musicData);
  const sortedRecords = $derived(data.sortedRecords);
  const availableDifficulties = $derived(data.availableDifficulties);
  const isLoggedIn = $derived(data.isLoggedIn);
  const hasAnyRecords = $derived(data.hasAnyRecords);
  const levelHistory = $derived(data.levelHistory);
  const playHistory = $derived(data.playHistory);
  const expandedHistoryGroups = new SvelteSet<string>();
  const historyDifficulties = [
    "basic",
    "advanced",
    "expert",
    "master",
    "ultima",
  ] as const;

  // Default selected tab is the first available difficulty
  let selectedDifficulty = $state<StdChartDifficulty>("master");

  // Update selectedDifficulty when availableDifficulties changes
  $effect(() => {
    if (
      availableDifficulties.length > 0 &&
      !availableDifficulties.includes(selectedDifficulty)
    ) {
      selectedDifficulty = availableDifficulties[0];
    }
  });

  // Derived values for formatting
  const formatDate = $derived((date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const formatShortDate = $derived((date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  });

  function getLampImage(score: number, fc: boolean, aj: boolean) {
    const lamp = getLamp(score, fc, aj);
    if (!lamp) return null;
    return `/lampmark/${lamp}.png`;
  }

  function getRankImage(score: number) {
    const rankIndex = getRank(score);
    return `/rankmark/${rankIndex}.png`;
  }

  function getClearMarkImage(clearMark: string | null) {
    if (!clearMark) return null;
    return `/clearmark/${clearMark.toLowerCase()}.png`;
  }

  function capitalizeDifficulty(diff: string) {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  }

  function formatLevel(
    chart: { level: string; constant: number | null } | null,
  ) {
    if (!chart) return "-";
    return chart.constant === null
      ? chart.level
      : `${chart.level} (${chart.constant.toFixed(1)})`;
  }

  function formatVersionRange(fromVersion: string, toVersion: string) {
    if (fromVersion === toVersion) {
      return getVersionNameMapping(fromVersion);
    }

    return `${getVersionNameMapping(fromVersion)} ~ ${getVersionNameMapping(
      toVersion,
    )}`;
  }

  function getHistoryRecords(difficulty: StdChartDifficulty) {
    return (
      playHistory?.records.filter(
        (record) => record.difficulty === difficulty,
      ) ?? []
    );
  }

  const recordTimelines = $derived.by(() =>
    Object.fromEntries(
      historyDifficulties.map((difficulty) => [
        difficulty,
        buildImprovementTimeline({
          improvements: sortedRecords[difficulty] ?? [],
          historyRecords: getHistoryRecords(difficulty),
          getImprovementTime: (record) => record.lastPlayed,
          getHistoryTime: (record) => record.playedAt,
          isSamePlay: (record, historyRecord) =>
            record.score === historyRecord.score &&
            record.clearMark === historyRecord.clearMark &&
            record.fc === historyRecord.fc &&
            record.aj === historyRecord.aj &&
            record.fullChain === historyRecord.fullChain,
          getId: (_record, index) => `${difficulty}-${index}`,
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

  function expandCurrentDifficulty() {
    expandedHistoryGroups.clear();
    for (const id of [
      recordTimelines[selectedDifficulty].topHistoryRecords.length > 0
        ? `${selectedDifficulty}-top`
        : null,
      ...recordTimelines[selectedDifficulty].entries
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
          <span>ID: {musicInfo.id}</span>
          {#if musicInfo.version}
            <span>•</span>
            <span>Version: {musicInfo.version}</span>
          {/if}
          <span>•</span>
          <span>Category: {musicInfo.category}</span>
          <span>•</span>
          <a
            href={`https://wikiwiki.jp/chunithmwiki/${encodeURIComponent(musicInfo.title)}`}
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
          >
            Wiki
            <ExternalLink class="size-3" />
          </a>
        </div>

        <!-- Chart Levels -->
        <div class="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
          {#each ["basic", "advanced", "expert", "master", "ultima"] as difficulty (difficulty)}
            {@const diff = difficulty as StdChartDifficulty}
            {#if musicData[diff]}
              <div
                class="px-2 sm:px-3 py-1 rounded-md text-white text-xs sm:text-sm font-semibold {difficultyColorMap[
                  diff
                ]}"
              >
                {capitalizeDifficulty(difficulty)}: {musicData[diff].level}
                {#if musicData[diff].constant && musicData[diff].constant >= 10}
                  ({musicData[diff].constant.toFixed(1)})
                {/if}
              </div>
            {/if}
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

    {#if levelHistory.length === 0}
      <div class="py-8 text-center text-gray-500">No level history found</div>
    {:else}
      <div class="overflow-x-auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="text-gray-900">Version</Table.Head>
              {#each historyDifficulties as difficulty (difficulty)}
                {#if difficulty !== "ultima" || musicData.ultima}
                  <Table.Head class="text-center text-gray-900">
                    {capitalizeDifficulty(difficulty)}
                  </Table.Head>
                {/if}
              {/each}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each levelHistory as row (`${row.fromVersion}-${row.toVersion}`)}
              <Table.Row>
                <Table.Cell class="font-medium text-gray-900">
                  {formatVersionRange(row.fromVersion, row.toVersion)}
                </Table.Cell>
                {#each historyDifficulties as difficulty (difficulty)}
                  {#if difficulty !== "ultima" || musicData.ultima}
                    <Table.Cell class="text-center text-gray-700">
                      {formatLevel(row.data[difficulty])}
                    </Table.Cell>
                  {/if}
                {/each}
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
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
            onclick={expandCurrentDifficulty}
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
      <Tabs.Root bind:value={selectedDifficulty}>
        <Tabs.List class="flex w-full gap-1 overflow-x-auto">
          {#each historyDifficulties as difficulty (difficulty)}
            {@const diff = difficulty as StdChartDifficulty}
            {@const hasRecords = sortedRecords[diff]?.length > 0}
            {@const isUltima = difficulty === "ultima"}
            {@const hasUltimaChart = musicData.ultima}

            {#if !isUltima || hasUltimaChart}
              <Tabs.Trigger
                value={difficulty}
                disabled={!hasRecords}
                class="min-w-max disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {capitalizeDifficulty(difficulty)}
                <span class="text-xs opacity-70">
                  ({playHistory?.playCounts[diff] ?? 0})
                </span>
              </Tabs.Trigger>
            {/if}
          {/each}
        </Tabs.List>

        {#each historyDifficulties as difficulty (difficulty)}
          {@const diff = difficulty as StdChartDifficulty}
          <Tabs.Content value={difficulty}>
            {@const timeline = recordTimelines[diff]}
            {#if timeline.entries.length > 0}
              <div class="mt-4 space-y-3">
                {#if timeline.topHistoryRecords.length > 0}
                  {@const topGroupId = `${diff}-top`}
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
                              <div class="font-bold text-gray-800">
                                {historyRecord.score.toLocaleString()}
                              </div>
                              <div
                                class="flex flex-wrap items-center gap-1 sm:justify-end"
                              >
                                {#if getClearMarkImage(historyRecord.clearMark)}
                                  <img
                                    src={getClearMarkImage(
                                      historyRecord.clearMark,
                                    )}
                                    alt={historyRecord.clearMark}
                                    class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                                  />
                                {/if}
                                <img
                                  src={getRankImage(historyRecord.score)}
                                  alt={ranks[getRank(historyRecord.score)]}
                                  class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                                />
                                {#if getLampImage(historyRecord.score, historyRecord.fc, historyRecord.aj)}
                                  <img
                                    src={getLampImage(
                                      historyRecord.score,
                                      historyRecord.fc,
                                      historyRecord.aj,
                                    )}
                                    alt="Lamp mark"
                                    class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                                  />
                                {/if}
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
                      <div class="text-xl sm:text-2xl font-bold text-gray-800">
                        {record.score.toLocaleString()}
                      </div>

                      <div
                        class="flex items-center gap-1 sm:gap-2 flex-wrap justify-end"
                      >
                        {#if getClearMarkImage(record.clearMark)}
                          <img
                            src={getClearMarkImage(record.clearMark)}
                            alt={record.clearMark}
                            class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                          />
                        {:else}
                          <div
                            class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] border-2 border-gray-300 bg-gray-200 rounded"
                          ></div>
                        {/if}

                        <img
                          src={getRankImage(record.score)}
                          alt={ranks[getRank(record.score)]}
                          class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                        />

                        {#if getLampImage(record.score, record.fc, record.aj)}
                          <img
                            src={getLampImage(
                              record.score,
                              record.fc,
                              record.aj,
                            )}
                            alt="Lamp mark"
                            class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                          />
                        {:else}
                          <div
                            class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] border-2 border-gray-300 bg-gray-200 rounded"
                          ></div>
                        {/if}

                        {#if record.fullChain > 0}
                          <img
                            src={record.fullChain === 1
                              ? "/lampmark/fullchain_gold.png"
                              : "/lampmark/fullchain_platinum.png"}
                            alt={`Full Chain ${record.fullChain === 1 ? "Gold" : "Platinum"}`}
                            class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                          />
                        {:else}
                          <div
                            class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] border-2 border-gray-300 bg-gray-200 rounded"
                          ></div>
                        {/if}
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
                                <div class="font-bold text-gray-800">
                                  {historyRecord.score.toLocaleString()}
                                </div>
                                <div
                                  class="flex flex-wrap items-center gap-1 sm:justify-end"
                                >
                                  {#if getClearMarkImage(historyRecord.clearMark)}
                                    <img
                                      src={getClearMarkImage(
                                        historyRecord.clearMark,
                                      )}
                                      alt={historyRecord.clearMark}
                                      class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                                    />
                                  {/if}
                                  <img
                                    src={getRankImage(historyRecord.score)}
                                    alt={ranks[getRank(historyRecord.score)]}
                                    class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                                  />
                                  {#if getLampImage(historyRecord.score, historyRecord.fc, historyRecord.aj)}
                                    <img
                                      src={getLampImage(
                                        historyRecord.score,
                                        historyRecord.fc,
                                        historyRecord.aj,
                                      )}
                                      alt="Lamp mark"
                                      class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                                    />
                                  {/if}
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
                No records found for this difficulty
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
</div>
