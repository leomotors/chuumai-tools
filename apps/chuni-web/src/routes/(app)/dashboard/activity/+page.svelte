<script lang="ts">
  import {
    activeDayCount,
    filterStatsByRange,
    longestActiveStreak,
    transformUserStats,
  } from "$lib/components/dashboard/stats";
  import StatsChart, {
    CHUNI_METRIC_CONFIG,
    type ChuniMetric,
  } from "$lib/components/StatsChart.svelte";
  import { formatChuniRating } from "$lib/utils/chuniRating";

  import {
    buildGainHeatmap,
    Heatmap,
    type HeatmapDay,
  } from "@repo/ui/molecule/Heatmap";

  let { data } = $props();

  let selectedMetric = $state<ChuniMetric>("rating");
  let timeRange = $state<number>(0);

  const allTransformed = $derived(transformUserStats(data.userStats));
  const filtered = $derived(filterStatsByRange(allTransformed, timeRange));
  const latest = $derived(
    allTransformed.length > 0
      ? allTransformed[allTransformed.length - 1]
      : undefined,
  );

  const heatmapDays = $derived.by((): HeatmapDay[] => {
    if (filtered.length === 0) return [];
    switch (selectedMetric) {
      case "playCount":
        return buildGainHeatmap(filtered, (record) => record.playCount);
      case "playerLevel":
        return buildGainHeatmap(filtered, (record) => record.playerLevel);
      case "rating":
        return buildGainHeatmap(filtered, (record) => record.rating, {
          detectReset: true,
        });
      case "overpower":
        return buildGainHeatmap(filtered, (record) => record.overpower);
    }
  });

  const totalPlays = $derived(latest?.playCount ?? 0);
  const activeDays = $derived(activeDayCount(allTransformed));
  const longestStreak = $derived(longestActiveStreak(allTransformed));

  function formatHeatmapTooltip(day: HeatmapDay): string {
    const dateStr = day.date.toLocaleDateString();
    const label = CHUNI_METRIC_CONFIG[selectedMetric].label;
    if (!day.hasData) return `${dateStr}: no data`;
    if (selectedMetric === "playCount") {
      return `${dateStr} — ${day.value.toLocaleString()} ${
        day.value === 1 ? "play" : "plays"
      }`;
    }
    const sign = day.value > 0 ? "+" : "";
    const formatted =
      selectedMetric === "rating"
        ? formatChuniRating(day.value)
        : selectedMetric === "overpower"
          ? day.value.toFixed(2)
          : day.value.toLocaleString();
    const suffix = day.isReset ? " (version reset)" : "";
    return `${dateStr} — ${label} ${sign}${formatted}${suffix}`;
  }
</script>

{#if allTransformed.length > 0}
  <StatsChart
    data={filtered}
    {selectedMetric}
    onMetricChange={(metric) => (selectedMetric = metric)}
    range={timeRange}
    onRangeChange={(range) => (timeRange = range)}
  />

  <section
    class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
  >
    <Heatmap
      days={heatmapDays}
      color={CHUNI_METRIC_CONFIG[selectedMetric].color}
      resetColor="#1e293b"
      showResetLegend={selectedMetric === "rating"}
      title="Daily Activity"
      subtitle="{CHUNI_METRIC_CONFIG[selectedMetric].label} · {timeRange === 0
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
