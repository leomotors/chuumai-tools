<script lang="ts">
  import { scaleLinear, scaleTime } from "d3-scale";
  import type { LineChart as LineChartType } from "layerchart";
  import type { Snippet } from "svelte";
  import { SvelteDate } from "svelte/reactivity";

  import { browser } from "$app/environment";
  import type { UserStats } from "$lib/functions/userStats";

  import * as Tabs from "@repo/ui/atom/tabs";

  // Dynamically import LayerChart only on client side
  let LineChart = $state<typeof LineChartType | null>(null);
  $effect(() => {
    if (browser) {
      import("layerchart").then((module) => {
        LineChart = module.LineChart;
      });
    }
  });

  type StatsChartProps = {
    userStats: UserStats[];
    header: Snippet;
  };

  let { userStats, header }: StatsChartProps = $props();

  // Chart state
  let xAxisMode = $state<"time" | "playCount">("time");

  // Selected metric for display (only show one at a time to avoid scale issues)
  let selectedMetric = $state<"playCount" | "rating" | "star">("rating");

  // Time range filter (in days, 0 = all)
  let timeRange = $state<number>(0);

  // Play count filter (number of plays, 0 = all)
  let playCountLimit = $state<number>(0);

  // Type for transformed chart data
  type ChartDataPoint = {
    date: Date;
    playCount: number;
    rating: number;
    star: number;
  };

  // Chart data transformations
  const chartData = $derived.by(() => {
    if (!userStats || userStats.length === 0) return [];

    // Sort by date ascending
    const sorted = [...userStats].sort(
      (a, b) =>
        new Date(a.lastPlayed).getTime() - new Date(b.lastPlayed).getTime(),
    );

    if (xAxisMode === "time") {
      // Filter by time range if set
      if (timeRange > 0) {
        const cutoffDate = new SvelteDate();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);
        return sorted.filter((s) => new Date(s.lastPlayed) >= cutoffDate);
      }
      return sorted;
    } else {
      // Filter by play count (last N plays)
      if (playCountLimit > 0) {
        return sorted.slice(-playCountLimit);
      }
      return sorted;
    }
  });

  // Transform data for chart
  const transformedData = $derived.by((): ChartDataPoint[] => {
    return chartData.map((s) => ({
      date: new Date(s.lastPlayed),
      playCount: s.playCountTotal,
      rating: s.rating,
      star: s.star,
    }));
  });

  // Metric configuration
  const metricConfig = {
    playerLevel: { label: "Player Level", color: "#3b82f6" },
    playCount: { label: "Play Count", color: "#22c55e" },
    rating: { label: "Rating", color: "#f97316" },
    star: { label: "Star", color: "#a855f7" },
  };

  // Build series for the selected metric only
  const chartSeries = $derived([
    {
      key: selectedMetric,
      label: metricConfig[selectedMetric].label,
      color: metricConfig[selectedMetric].color,
    },
  ]);
</script>

<div
  class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md flex flex-col gap-4"
>
  <h2 class="text-lg font-semibold text-gray-800">Play Statistics</h2>

  {@render header()}

  <!-- X-Axis Mode Tabs -->
  <Tabs.Root
    value={xAxisMode}
    onValueChange={(v: string | undefined) => {
      if (v) xAxisMode = v as "time" | "playCount";
    }}
    class="w-full"
  >
    <Tabs.List class="grid w-full grid-cols-2">
      <Tabs.Trigger value="time">By Time</Tabs.Trigger>
      <Tabs.Trigger value="playCount">By Play Count</Tabs.Trigger>
    </Tabs.List>

    <!-- Filters -->
    {#if xAxisMode === "time"}
      <div class="my-4 flex flex-wrap gap-2">
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {timeRange === 0
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (timeRange = 0)}
        >
          All Time
        </button>
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {timeRange ===
          30
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (timeRange = 30)}
        >
          30 Days
        </button>
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {timeRange ===
          90
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (timeRange = 90)}
        >
          90 Days
        </button>
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {timeRange ===
          365
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (timeRange = 365)}
        >
          1 Year
        </button>
      </div>
    {:else}
      <div class="my-4 flex flex-wrap gap-2">
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {playCountLimit ===
          0
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (playCountLimit = 0)}
        >
          All Plays
        </button>
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {playCountLimit ===
          10
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (playCountLimit = 10)}
        >
          Last 10
        </button>
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {playCountLimit ===
          50
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (playCountLimit = 50)}
        >
          Last 50
        </button>
        <button
          class="px-3 py-1 text-sm rounded-md transition-colors {playCountLimit ===
          100
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}"
          onclick={() => (playCountLimit = 100)}
        >
          Last 100
        </button>
      </div>
    {/if}

    <!-- Metric Selection -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        class="px-3 py-1.5 text-sm rounded-md transition-colors font-medium {selectedMetric ===
        'rating'
          ? 'bg-blue-500 text-white'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}"
        onclick={() => (selectedMetric = "rating")}
      >
        Rating
      </button>
      {#if xAxisMode === "time"}
        <button
          class="px-3 py-1.5 text-sm rounded-md transition-colors font-medium {selectedMetric ===
          'playCount'
            ? 'bg-green-500 text-white'
            : 'bg-green-100 text-green-700 hover:bg-green-200'}"
          onclick={() => (selectedMetric = "playCount")}
        >
          Play Count
        </button>
      {/if}
      <button
        class="px-3 py-1.5 text-sm rounded-md transition-colors font-medium {selectedMetric ===
        'star'
          ? 'bg-purple-500 text-white'
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}"
        onclick={() => (selectedMetric = "star")}
      >
        Star
      </button>
    </div>

    <!-- Chart Content with fixed height to prevent layout shift -->
    <div class="h-96 w-full">
      <Tabs.Content value="time" class="h-full">
        {#if !browser || !LineChart}
          <div class="flex h-full items-center justify-center text-gray-500">
            Loading chart...
          </div>
        {:else if transformedData.length > 0}
          <LineChart
            data={transformedData}
            x="date"
            xScale={scaleTime()}
            series={chartSeries}
            axis
            props={{
              xAxis: {
                format: (d: Date) =>
                  d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: transformedData.length > 90 ? "2-digit" : undefined,
                  }),
                labelProps: {
                  class: "text-xs fill-gray-600",
                },
              },
              yAxis: {
                labelProps: {
                  class: "text-xs fill-gray-600",
                },
              },
            }}
          />
        {:else}
          <div class="flex h-full items-center justify-center text-gray-500">
            No data available for selected time range
          </div>
        {/if}
      </Tabs.Content>

      <Tabs.Content value="playCount" class="h-full">
        {#if !browser || !LineChart}
          <div class="flex h-full items-center justify-center text-gray-500">
            Loading chart...
          </div>
        {:else if transformedData.length > 0}
          <LineChart
            data={transformedData}
            x="playCount"
            xScale={scaleLinear()}
            series={chartSeries}
            axis
            padding={{ left: 60, right: 20, top: 20, bottom: 40 }}
            props={{
              xAxis: {
                labelProps: {
                  class: "text-xs fill-gray-600",
                },
              },
              yAxis: {
                labelProps: {
                  class: "text-xs fill-gray-600",
                },
              },
            }}
          />
        {:else}
          <div class="flex h-full items-center justify-center text-gray-500">
            No data available
          </div>
        {/if}
      </Tabs.Content>
    </div>
  </Tabs.Root>
</div>
