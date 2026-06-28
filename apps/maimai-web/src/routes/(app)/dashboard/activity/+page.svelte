<script lang="ts">
  import {
    activeDayCount,
    filterStatsByRange,
    longestActiveStreak,
    transformUserStats,
  } from "$lib/components/dashboard/stats";
  import StatsChart, {
    MAIMAI_METRIC_CONFIG,
    type MaimaiMetric,
  } from "$lib/components/StatsChart.svelte";

  import { maimaiRatingMilestones } from "@repo/core/maimai";
  import { mergeManualRatingRecords, withMaxRating } from "@repo/core/web";
  import {
    buildGainHeatmap,
    Heatmap,
    type HeatmapDay,
  } from "@repo/ui/molecule/Heatmap";

  let { data } = $props();

  let selectedMetric = $state<MaimaiMetric>("rating");
  let timeRange = $state<number>(0);

  const scrapedTransformed = $derived(transformUserStats(data.userStats));
  const ratingTransformed = $derived(
    withMaxRating(
      mergeManualRatingRecords(
        scrapedTransformed.map(
          ({ maxRating: _maxRating, ...record }) => record,
        ),
        data.manualRatings,
      ),
    ),
  );
  const selectedRecords = $derived(
    selectedMetric === "rating" || selectedMetric === "maxRating"
      ? ratingTransformed
      : scrapedTransformed,
  );
  const filtered = $derived(filterStatsByRange(selectedRecords, timeRange));
  const filteredScraped = $derived(
    filterStatsByRange(scrapedTransformed, timeRange),
  );
  const filteredRating = $derived(
    filterStatsByRange(ratingTransformed, timeRange),
  );
  const latest = $derived(
    scrapedTransformed.length > 0
      ? scrapedTransformed[scrapedTransformed.length - 1]
      : undefined,
  );

  const heatmapDays = $derived.by((): HeatmapDay[] => {
    if (filtered.length === 0) return [];
    switch (selectedMetric) {
      case "playCount":
        return buildGainHeatmap(filteredScraped, (record) => record.playCount);
      case "rating":
        return buildGainHeatmap(filteredRating, (record) => record.rating, {
          detectReset: true,
        });
      case "maxRating":
        return buildGainHeatmap(filteredRating, (record) => record.maxRating);
      case "star":
        return buildGainHeatmap(filteredScraped, (record) => record.star);
    }
  });

  const totalPlays = $derived(latest?.playCount ?? 0);
  const activeDays = $derived(activeDayCount(scrapedTransformed));
  const longestStreak = $derived(longestActiveStreak(scrapedTransformed));

  function formatHeatmapTooltip(day: HeatmapDay): string {
    const dateStr = day.date.toLocaleDateString();
    const label = MAIMAI_METRIC_CONFIG[selectedMetric].label;
    if (!day.hasData) return `${dateStr}: no data`;
    if (selectedMetric === "playCount") {
      return `${dateStr} - ${day.value.toLocaleString()} ${
        day.value === 1 ? "play" : "plays"
      }`;
    }
    const sign = day.value > 0 ? "+" : "";
    const suffix = day.isReset ? " (version reset)" : "";
    return `${dateStr} - ${label} ${sign}${day.value.toLocaleString()}${suffix}`;
  }
</script>

{#if ratingTransformed.length > 0}
  <StatsChart
    data={filtered}
    {selectedMetric}
    onMetricChange={(metric) => (selectedMetric = metric)}
    range={timeRange}
    onRangeChange={(range) => (timeRange = range)}
    milestones={[...maimaiRatingMilestones]}
  />

  <section
    class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
  >
    <Heatmap
      days={heatmapDays}
      color={MAIMAI_METRIC_CONFIG[selectedMetric].color}
      showResetLegend={selectedMetric === "rating"}
      title="Daily Activity"
      subtitle="{MAIMAI_METRIC_CONFIG[selectedMetric].label} / {timeRange === 0
        ? 'all time'
        : timeRange === 365
          ? 'last year'
          : `last ${timeRange} days`}"
      formatTooltip={formatHeatmapTooltip}
    >
      {#snippet footer()}
        <div>
          <b class="font-semibold text-gray-900">
            {totalPlays.toLocaleString()}
          </b>
          total plays
        </div>
        <div>
          <b class="font-semibold text-gray-900">
            {activeDays.toLocaleString()}
          </b>
          active days
        </div>
        <div>
          <b class="font-semibold text-gray-900">{longestStreak}</b>
          longest streak
        </div>
      {/snippet}
    </Heatmap>
  </section>
{:else}
  <section
    class="rounded-xl border border-gray-200/70 bg-white px-5 py-8 text-center shadow-sm"
  >
    <h2 class="text-sm font-semibold text-gray-900">No activity yet</h2>
    <p class="mt-1 text-xs text-gray-500">
      Activity appears after the first completed scrape job.
    </p>
  </section>
{/if}
