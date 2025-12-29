<script lang="ts">
  import { difficultyColorMap, getLamp, getRank } from "@repo/core/chuni";
  import { ranks, type StdChartDifficulty } from "@repo/types/chuni";
  import * as Tabs from "@repo/ui/atom/tabs";

  let { data } = $props();

  const musicRecord = $derived(data.musicRecord);
  const musicData = $derived(data.musicData);
  const sortedRecords = $derived(data.sortedRecords);
  const availableDifficulties = $derived(data.availableDifficulties);

  // Check if there are any records at all
  const hasAnyRecords = $derived(
    Object.values(sortedRecords).some(
      (records) => records && records.length > 0,
    ),
  );

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
          <span>ID: {musicRecord.musicInfo.id}</span>
          {#if musicRecord.musicInfo.version}
            <span>•</span>
            <span>Version: {musicRecord.musicInfo.version}</span>
          {/if}
          <span>•</span>
          <span>Category: {musicRecord.musicInfo.category}</span>
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
      <Tabs.Root bind:value={selectedDifficulty}>
        <Tabs.List class="grid w-full grid-cols-5 gap-1">
          {#each ["basic", "advanced", "expert", "master", "ultima"] as difficulty (difficulty)}
            {@const diff = difficulty as StdChartDifficulty}
            {@const hasRecords = sortedRecords[diff]?.length > 0}
            {@const isUltima = difficulty === "ultima"}
            {@const hasUltimaChart = musicData.ultima}

            {#if !isUltima || hasUltimaChart}
              <Tabs.Trigger
                value={difficulty}
                disabled={!hasRecords}
                class="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {capitalizeDifficulty(difficulty)}
              </Tabs.Trigger>
            {/if}
          {/each}
        </Tabs.List>

        {#each ["basic", "advanced", "expert", "master", "ultima"] as difficulty (difficulty)}
          {@const diff = difficulty as StdChartDifficulty}
          <Tabs.Content value={difficulty}>
            {#if sortedRecords[diff]?.length > 0}
              <div class="mt-4 space-y-3">
                {#each sortedRecords[diff] as record, index (index)}
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

                      <!-- Marks Row -->
                      <div
                        class="flex items-center gap-1 sm:gap-2 flex-wrap justify-end"
                      >
                        <!-- Clear Mark -->
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

                        <!-- Rank Image -->
                        <img
                          src={getRankImage(record.score)}
                          alt={ranks[getRank(record.score)]}
                          class="w-12 sm:w-14 md:w-16 h-[14px] sm:h-[16px] md:h-[18px] object-contain"
                        />

                        <!-- Lamp Image -->
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

                        <!-- Full Chain -->
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
