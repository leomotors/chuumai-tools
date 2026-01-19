<script lang="ts">
  import { difficultyColorMap, getDXStar, getRank } from "@repo/core/maimai";
  import { ranks, type StdChartDifficulty } from "@repo/types/maimai";
  import * as Tabs from "@repo/ui/atom/tabs";

  let { data } = $props();

  const musicRecord = $derived(data.musicRecord);
  const musicDataForTitle = $derived(data.musicDataForTitle);
  const sortedRecords = $derived(data.sortedRecords);
  const availableCharts = $derived(data.availableCharts);
  const hasAnyRecords = $derived(data.hasAnyRecords);

  // Default selected tab is the first available chart
  let selectedChart = $state<string>("");

  // Update selectedChart when availableCharts changes
  $effect(() => {
    if (availableCharts.length > 0 && !selectedChart) {
      selectedChart = availableCharts[0].key;
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
</script>

<div class="mx-auto max-w-6xl w-full space-y-6">
  <!-- Navigation Buttons -->
  <div class="flex gap-3">
    <a
      href="/dashboard"
      class="px-3 py-1.5 text-sm border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-colors duration-200"
    >
      ← Dashboard
    </a>
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
        src="/api/imageProxy?img={musicRecord.musicInfo.image}"
        alt={musicRecord.musicInfo.title}
        class="size-32 rounded-lg object-cover mx-auto sm:mx-0 flex-shrink-0"
      />
      <div class="flex-1 space-y-2 text-center sm:text-left">
        <h1 class="text-2xl font-bold text-gray-800">
          {musicRecord.musicInfo.title}
        </h1>
        <p class="text-lg text-gray-600">{musicRecord.musicInfo.artist}</p>
        <div
          class="flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1 text-sm text-gray-500"
        >
          <span>Category: {musicRecord.musicInfo.category}</span>
          <span>•</span>
          <span>Version: {musicRecord.musicInfo.version}</span>
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

  <!-- Records Section -->
  <div
    class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
  >
    <h2 class="text-xl font-bold text-gray-800 mb-4">Play Records</h2>

    {#if !hasAnyRecords}
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
        <Tabs.List
          class="grid w-full gap-1"
          style="grid-template-columns: repeat({availableCharts.length}, 1fr);"
        >
          {#each availableCharts as chart (chart.key)}
            <Tabs.Trigger value={chart.key}>
              {capitalizeChartType(chart.chartType)} - {capitalizeDifficulty(
                chart.difficulty,
              )}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>

        {#each availableCharts as chart (chart.key)}
          <Tabs.Content value={chart.key}>
            {#if sortedRecords[chart.key]?.length > 0}
              <div class="mt-4 space-y-3">
                {#each sortedRecords[chart.key] as record, index (index)}
                  <div
                    class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50/50"
                  >
                    <!-- Timestamp on Left -->
                    <div class="flex-1">
                      <div
                        class="text-lg sm:text-xl font-semibold text-gray-900"
                      >
                        {formatDate(record.lastPlayed)}
                      </div>
                    </div>

                    <!-- Score and Marks on Right -->
                    <div class="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <!-- Score -->
                      <div class="text-xl sm:text-2xl font-bold text-gray-800">
                        {record.score.toLocaleString()}
                      </div>

                      <!-- DX Score -->
                      <div
                        class="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span>
                          DX: {record.dxScore.toLocaleString()} / {record.dxScoreMax.toLocaleString()}
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

                      <!-- Marks Row -->
                      <div
                        class="flex items-center gap-1 sm:gap-2 flex-wrap justify-end"
                      >
                        <!-- Rank Image -->
                        <img
                          src={getRankImage(record.score)}
                          alt={ranks[getRank(record.score)]}
                          class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                        />

                        <!-- Combo Mark -->
                        <img
                          src={getComboMarkImage(record.comboMark)}
                          alt={record.comboMark}
                          class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                        />

                        <!-- Sync Mark -->
                        <img
                          src={getSyncMarkImage(record.syncMark)}
                          alt={record.syncMark}
                          class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                        />
                      </div>
                    </div>
                  </div>
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
</div>
