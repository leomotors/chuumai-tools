<script lang="ts">
  import { Key, RefreshCw } from "@lucide/svelte";
  import { SvelteDate } from "svelte/reactivity";

  import { enhance } from "$app/forms";
  import StatsChart, {
    CHUNI_METRIC_CONFIG,
    type ChuniMetric,
    type StatsChartTransformed,
  } from "$lib/components/StatsChart.svelte";
  import {
    formatChuniRating,
    resolveChuniRating,
  } from "$lib/utils/chuniRating";

  import { ApiKeySection } from "@repo/ui/molecule/ApiKeySection";
  import {
    buildGainHeatmap,
    Heatmap,
    type HeatmapDay,
  } from "@repo/ui/molecule/Heatmap";
  import { KpiTile } from "@repo/ui/molecule/KpiTile";
  import { UserProfileCard } from "@repo/ui/molecule/UserProfileCard";

  let { data, form } = $props();

  let isGenerating = $state(false);
  let showKey = $state(false);
  let selectedMetric = $state<ChuniMetric>("rating");
  let timeRange = $state<number>(0);

  const hasApiKey = $derived(data.apiKey || (form?.success && form?.apiKey));

  // Transform raw userStats into ChartDataPoints (sorted ascending by date).
  const allTransformed = $derived.by((): StatsChartTransformed[] => {
    if (!data.userStats || data.userStats.length === 0) return [];
    return [...data.userStats]
      .sort(
        (a, b) =>
          new Date(a.lastPlayed).getTime() - new Date(b.lastPlayed).getTime(),
      )
      .map((s) => ({
        date: new Date(s.lastPlayed),
        playCount: s.playCount,
        playerLevel: s.playerLevel,
        rating: resolveChuniRating(s.rating, s.calculatedRating),
        overpower: parseFloat(s.overpowerValue),
      }));
  });

  // Apply time-range filter (used by the chart and heatmap).
  const filtered = $derived.by((): StatsChartTransformed[] => {
    if (timeRange <= 0) return allTransformed;
    const cutoff = new SvelteDate();
    cutoff.setDate(cutoff.getDate() - timeRange);
    return allTransformed.filter((s) => s.date >= cutoff);
  });

  function lastPlayLabel(): string | undefined {
    if (allTransformed.length === 0) return undefined;
    const last = allTransformed[allTransformed.length - 1].date;
    const diffMs = Date.now() - last.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return last.toLocaleDateString();
  }

  function deltaSinceMonthAgo(getValue: (r: StatsChartTransformed) => number): {
    text: string;
    positive: boolean;
  } | null {
    if (allTransformed.length === 0) return null;
    const cutoff = new SvelteDate();
    cutoff.setDate(cutoff.getDate() - 30);
    // Find last record before cutoff. If none, use the first record.
    const before = allTransformed.findLast((r) => r.date < cutoff);
    const baseline = before ? getValue(before) : getValue(allTransformed[0]);
    const current = getValue(allTransformed[allTransformed.length - 1]);
    const diff = current - baseline;
    if (diff === 0 && before) return null;
    const positive = diff >= 0;
    const sign = diff >= 0 ? "+" : "";
    return { text: `${sign}${diff.toLocaleString()}`, positive };
  }

  function ratingDelta() {
    return deltaSinceMonthAgo((r) => r.rating);
  }
  function levelDelta() {
    return deltaSinceMonthAgo((r) => r.playerLevel);
  }
  function overpowerDelta() {
    return deltaSinceMonthAgo((r) => r.overpower);
  }
  function playsDeltaWeek(): { text: string; positive: boolean } | null {
    if (allTransformed.length === 0) return null;
    const cutoff = new SvelteDate();
    cutoff.setDate(cutoff.getDate() - 7);
    const before = allTransformed.findLast((r) => r.date < cutoff);
    const baseline = before ? before.playCount : allTransformed[0].playCount;
    const current = allTransformed[allTransformed.length - 1].playCount;
    const diff = current - baseline;
    return { text: `+${diff.toLocaleString()}`, positive: diff >= 0 };
  }

  // Sparkline values: last 30 days of the metric (cumulative for level/rating/op,
  // counts for plays).
  function sparklineValues(metric: ChuniMetric): number[] {
    const last30 = allTransformed.slice(-30);
    if (metric === "playCount") {
      return last30.map((r) => r.playCount);
    }
    return last30.map((r) => r[metric] as number);
  }

  // Latest values for KPI tiles.
  const latest = $derived(
    allTransformed.length > 0
      ? allTransformed[allTransformed.length - 1]
      : undefined,
  );

  // Heatmap data (uses same time-range filter as chart, metric-aware).
  const heatmapDays = $derived.by((): HeatmapDay[] => {
    if (filtered.length === 0) return [];
    switch (selectedMetric) {
      case "playCount":
        return buildGainHeatmap(filtered, (r) => r.playCount);
      case "playerLevel":
        return buildGainHeatmap(filtered, (r) => r.playerLevel);
      case "rating":
        return buildGainHeatmap(filtered, (r) => r.rating, {
          detectReset: true,
        });
      case "overpower":
        return buildGainHeatmap(filtered, (r) => r.overpower);
    }
  });

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

  // Heatmap stats footer (always uses unfiltered/all data for totals).
  const totalPlays = $derived(latest?.playCount ?? 0);
  const activeDays = $derived(
    new Set(
      allTransformed.map((r) =>
        new Date(
          r.date.getFullYear(),
          r.date.getMonth(),
          r.date.getDate(),
        ).getTime(),
      ),
    ).size,
  );
  const longestStreak = $derived.by((): number => {
    if (allTransformed.length === 0) return 0;
    const dayKeys = new Set(
      allTransformed.map((r) =>
        new Date(
          r.date.getFullYear(),
          r.date.getMonth(),
          r.date.getDate(),
        ).getTime(),
      ),
    );
    const sorted = [...dayKeys].sort((a, b) => a - b);
    let longest = 1;
    let current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const expected = new Date(
        prev.getFullYear(),
        prev.getMonth(),
        prev.getDate() + 1,
      ).getTime();
      if (sorted[i] === expected) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }
    return longest;
  });
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <!-- Hero: profile + KPI tiles -->
  <section class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_3fr]">
    <UserProfileCard
      user={data.user}
      meta={[
        { label: `${data.jobCount ?? 0} jobs`, dotColor: "#10b981" },
        ...(lastPlayLabel() ? [{ label: `last play ${lastPlayLabel()}` }] : []),
      ]}
      onSettings={() => (showKey = !showKey)}
      settingsActive={showKey}
    />

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#if latest}
        {@const rd = ratingDelta()}
        <KpiTile
          label="Rating"
          value={formatChuniRating(latest.rating)}
          delta={rd?.text}
          deltaPositive={rd?.positive ?? true}
          color={CHUNI_METRIC_CONFIG.rating.color}
          primary
          sparklineValues={sparklineValues("rating")}
        />
        {@const od = overpowerDelta()}
        <KpiTile
          label="Overpower"
          value={parseFloat(
            allTransformed[allTransformed.length - 1].overpower.toFixed(2),
          ).toLocaleString()}
          delta={od?.text}
          deltaPositive={od?.positive ?? true}
          color={CHUNI_METRIC_CONFIG.overpower.color}
          sparklineValues={sparklineValues("overpower")}
        />
        {@const pd = playsDeltaWeek()}
        <KpiTile
          label="Play Count"
          value={latest.playCount.toLocaleString()}
          delta={pd?.text}
          deltaSuffix="this week"
          deltaPositive={pd?.positive ?? true}
          color={CHUNI_METRIC_CONFIG.playCount.color}
          sparklineValues={sparklineValues("playCount")}
        />
        {@const ld = levelDelta()}
        <KpiTile
          label="Player Level"
          value={latest.playerLevel.toLocaleString()}
          delta={ld?.text}
          deltaPositive={ld?.positive ?? true}
          color={CHUNI_METRIC_CONFIG.playerLevel.color}
          sparklineValues={sparklineValues("playerLevel")}
        />
      {/if}
    </div>
  </section>

  {#if showKey}
    <section>
      <ApiKeySection
        apiKey={data.apiKey}
        apiKeyCreatedAt={data.apiKeyCreatedAt}
        formApiKey={form?.apiKey}
        formSuccess={form?.success}
      >
        {#snippet generateForm()}
          <form
            method="POST"
            action="?/generateApiKey"
            use:enhance={() => {
              isGenerating = true;
              return async ({ update }) => {
                await update();
                isGenerating = false;
              };
            }}
          >
            <button
              type="submit"
              disabled={isGenerating}
              class="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 {hasApiKey
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-blue-500 hover:bg-blue-600'}"
            >
              {#if hasApiKey}
                <RefreshCw class="size-3.5" />
                {isGenerating ? "Regenerating..." : "Regenerate"}
              {:else}
                <Key class="size-3.5" />
                {isGenerating ? "Generating..." : "Generate API Key"}
              {/if}
            </button>
          </form>
        {/snippet}
      </ApiKeySection>
    </section>
  {/if}

  {#if allTransformed.length > 0}
    <StatsChart
      data={filtered}
      {selectedMetric}
      onMetricChange={(m) => (selectedMetric = m)}
      range={timeRange}
      onRangeChange={(r) => (timeRange = r)}
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
            <b class="font-semibold text-gray-900"
              >{totalPlays.toLocaleString()}</b
            >
            total plays
          </div>
          <div>
            <b class="font-semibold text-gray-900"
              >{activeDays.toLocaleString()}</b
            >
            active days
          </div>
          <div>
            <b class="font-semibold text-gray-900">{longestStreak}</b>
            longest streak
          </div>
        {/snippet}
      </Heatmap>
    </section>
  {/if}
</div>
