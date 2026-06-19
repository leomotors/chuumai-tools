<script lang="ts">
  import { Eye, ListMusic } from "@lucide/svelte";

  import RatingMusicCard from "$lib/components/dashboard/RatingMusicCard.svelte";

  import {
    type RatingRangeSummary,
    summarizeRatings,
    takeRatingWindow,
  } from "@repo/core/web";

  let { data } = $props();

  type Mode = "BEST" | "CURRENT" | "ALL";

  const modes: Mode[] = ["BEST", "CURRENT", "ALL"];
  let mode = $state<Mode>("BEST");
  let bottom = $state(false);
  let showSelection = $state(false);

  const baseRecords = $derived.by(() => {
    if (!data.music) return [];
    if (mode === "BEST") return data.music.best;
    if (mode === "CURRENT") return data.music.current;
    return takeRatingWindow(data.music.total, { limit: 100, bottom });
  });
  const selectionRecords = $derived.by(() => {
    if (!data.music) return [];
    if (mode === "BEST") return data.music.selectionBest;
    if (mode === "CURRENT") return data.music.selectionCurrent;
    return [];
  });
  const visibleRecords = $derived([...baseRecords, ...selectionRecords]);
  const showingLabel = $derived(
    mode === "ALL"
      ? `${visibleRecords.length}`
      : `${baseRecords.length} + ${selectionRecords.length}`,
  );
  const summary = $derived.by((): RatingRangeSummary => {
    if (mode === "BEST") {
      return summarizeRatings(baseRecords, { divisor: 30 });
    }
    if (mode === "CURRENT") {
      return summarizeRatings(baseRecords, { divisor: 20 });
    }
    return summarizeRatings(baseRecords, { limit: 50 });
  });
  const rangeLabel = $derived(
    mode === "ALL"
      ? bottom
        ? "Bottom 50"
        : "Top 50"
      : mode === "BEST"
        ? "1-30"
        : "1-20",
  );

  function formatRating(value: number | null) {
    return value === null ? "--" : value.toFixed(4);
  }

  function formatRange(value: RatingRangeSummary) {
    if (value.min === null || value.max === null) return "--";
    return `${value.min.toFixed(2)} - ${value.max.toFixed(2)}`;
  }
</script>

{#if data.music}
  <section class="space-y-4">
    <div
      class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
    >
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div class="flex items-center gap-2">
            <ListMusic class="size-5 text-gray-700" />
            <h1 class="text-lg font-semibold text-gray-950">
              Music for Rating
            </h1>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Job #{data.music.jobId} · {data.music.version}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          {#each modes as item (item)}
            <button
              type="button"
              onclick={() => {
                mode = item;
                showSelection = false;
              }}
              class="h-9 rounded-lg px-3 text-sm font-semibold transition-colors {mode ===
              item
                ? 'bg-gray-950 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'}"
            >
              {item}
            </button>
          {/each}
        </div>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div class="text-xs font-medium text-gray-500">AVG</div>
          <div class="mt-1 text-2xl font-bold text-gray-950">
            {formatRating(summary.avg)}
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div class="text-xs font-medium text-gray-500">
            Range ({rangeLabel})
          </div>
          <div class="mt-1 text-2xl font-bold text-gray-950">
            {formatRange(summary)}
          </div>
        </div>
        <div
          class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
        >
          <div>
            <div class="text-xs font-medium text-gray-500">Showing</div>
            <div class="mt-1 text-2xl font-bold text-gray-950">
              {showingLabel}
            </div>
          </div>
          {#if mode === "ALL"}
            <label
              class="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                bind:checked={bottom}
                class="size-4 rounded border-gray-300 accent-gray-950"
              />
              Bottom 100
            </label>
          {/if}
        </div>
      </div>
    </div>

    {#if baseRecords.length === 0 && selectionRecords.length === 0}
      <div
        class="rounded-xl border border-gray-200/70 bg-white px-5 py-8 text-center shadow-sm"
      >
        <h2 class="text-sm font-semibold text-gray-900">No records found</h2>
        <p class="mt-1 text-xs text-gray-500">
          Rating records appear after a completed scrape job.
        </p>
      </div>
    {:else}
      {#if baseRecords.length > 0}
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {#each baseRecords as music, index (`${music.id}-${music.difficulty}-${music.source}-${index}`)}
            <RatingMusicCard {music} {index} />
          {/each}
        </div>
      {/if}

      {#if selectionRecords.length > 0}
        {#if showSelection}
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-sm font-semibold text-gray-700">
                Selection ({selectionRecords.length})
              </h2>
              <button
                type="button"
                onclick={() => (showSelection = false)}
                class="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                Hide
              </button>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {#each selectionRecords as music, index (`${music.id}-${music.difficulty}-${music.source}-${index}`)}
                <RatingMusicCard {music} index={baseRecords.length + index} />
              {/each}
            </div>
          </div>
        {:else}
          <button
            type="button"
            onclick={() => (showSelection = true)}
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-6 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            <Eye class="size-4" />
            Show {selectionRecords.length} selection {selectionRecords.length ===
            1
              ? "song"
              : "songs"}
          </button>
        {/if}
      {/if}
    {/if}
  </section>
{:else}
  <section
    class="rounded-xl border border-gray-200/70 bg-white px-5 py-8 text-center shadow-sm"
  >
    <h1 class="text-sm font-semibold text-gray-900">No rating data yet</h1>
    <p class="mt-1 text-xs text-gray-500">
      Music for Rating appears after the first completed scrape job.
    </p>
  </section>
{/if}
