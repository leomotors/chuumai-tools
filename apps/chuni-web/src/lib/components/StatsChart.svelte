<script lang="ts" module>
  export type ChuniMetric =
    | "playerLevel"
    | "playCount"
    | "rating"
    | "maxRating"
    | "overpower";

  export type StatsChartTransformed = {
    date: Date;
    playCount: number;
    playerLevel: number;
    rating: number;
    maxRating: number;
    overpower: number;
  };

  export const CHUNI_METRIC_CONFIG: Record<
    ChuniMetric,
    { label: string; color: string }
  > = {
    playerLevel: { label: "Player Level", color: "#3b82f6" },
    playCount: { label: "Play Count", color: "#22c55e" },
    rating: { label: "Rating", color: "#f97316" },
    maxRating: { label: "Max Rating", color: "#ef4444" },
    overpower: { label: "Overpower", color: "#a855f7" },
  };
</script>

<script lang="ts">
  import { scaleTime } from "d3-scale";
  import type {
    LineChart as LineChartType,
    Spline as SplineType,
  } from "layerchart";

  import { browser } from "$app/environment";

  // Dynamically import LayerChart only on client side
  let LineChart = $state<typeof LineChartType | null>(null);
  let Spline = $state<typeof SplineType | null>(null);
  $effect(() => {
    if (browser) {
      import("layerchart").then((module) => {
        LineChart = module.LineChart;
        Spline = module.Spline;
      });
    }
  });

  type Props = {
    data: StatsChartTransformed[];
    selectedMetric: ChuniMetric;
    onMetricChange: (m: ChuniMetric) => void;
    range: number;
    onRangeChange: (r: number) => void;
  };

  let { data, selectedMetric, onMetricChange, range, onRangeChange }: Props =
    $props();

  const chartSeries = $derived([
    {
      key: selectedMetric,
      label: CHUNI_METRIC_CONFIG[selectedMetric].label,
      color: CHUNI_METRIC_CONFIG[selectedMetric].color,
    },
  ]);

  const yDomain = $derived.by((): [number, number] | undefined => {
    if (data.length === 0) return undefined;
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      const v = d[selectedMetric];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) {
      const pad = Math.max(1, Math.abs(min) * 0.05);
      return [min - pad, max + pad];
    }
    const pad = (max - min) * 0.1;
    return [min - pad, max + pad];
  });

  const rangeOptions: [number, string][] = [
    [30, "30D"],
    [90, "90D"],
    [365, "1Y"],
    [0, "All"],
  ];

  function rangeLabel(r: number): string {
    const found = rangeOptions.find(([v]) => v === r);
    if (!found) return "";
    if (r === 0) return "all time";
    if (r === 365) return "last year";
    return `last ${r} days`;
  }
</script>

<div class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm">
  <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 class="text-[15px] font-semibold tracking-tight text-gray-900">
        Progression
      </h2>
      <p class="mt-0.5 text-[11.5px] text-gray-400">
        {CHUNI_METRIC_CONFIG[selectedMetric].label} over {rangeLabel(range)}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex flex-wrap gap-1">
        {#each Object.entries(CHUNI_METRIC_CONFIG) as [key, cfg] (key)}
          {@const isOn = selectedMetric === key}
          <button
            type="button"
            onclick={() => onMetricChange(key as ChuniMetric)}
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors"
            class:border-gray-300={isOn}
            class:bg-gray-100={isOn}
            class:text-gray-900={isOn}
            class:border-gray-200={!isOn}
            class:text-gray-500={!isOn}
            class:hover:text-gray-900={!isOn}
          >
            <span
              class="size-[7px] rounded-full"
              style:background-color={cfg.color}
              aria-hidden="true"
            ></span>
            {cfg.label}
          </button>
        {/each}
      </div>
      <div class="inline-flex gap-0.5 rounded-lg bg-gray-100 p-0.5">
        {#each rangeOptions as [v, l] (v)}
          {@const isOn = range === v}
          <button
            type="button"
            onclick={() => onRangeChange(v)}
            class="rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors"
            class:bg-white={isOn}
            class:text-gray-900={isOn}
            class:shadow-sm={isOn}
            class:text-gray-500={!isOn}
            class:hover:text-gray-900={!isOn}
          >
            {l}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="h-72 w-full">
    {#if !browser || !LineChart}
      <div
        class="flex h-full items-center justify-center text-sm text-gray-400"
      >
        Loading chart...
      </div>
    {:else if data.length > 0}
      <LineChart
        {data}
        x="date"
        xScale={scaleTime()}
        {yDomain}
        yNice
        series={chartSeries}
        axis
        props={{
          xAxis: {
            format: (d: Date) =>
              d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: data.length > 90 ? "2-digit" : undefined,
              }),
            labelProps: {
              class: "text-xs fill-gray-500",
            },
          },
          yAxis: {
            labelProps: {
              class: "text-xs fill-gray-500",
            },
          },
        }}
      >
        {#snippet spline({ props })}
          {#if selectedMetric === "maxRating" && Spline}
            <Spline {...props} stroke="#94a3b8" opacity={0.9} />
            <Spline
              {...props}
              stroke={CHUNI_METRIC_CONFIG.maxRating.color}
              defined={(d: StatsChartTransformed) => d.rating === d.maxRating}
            />
          {:else if Spline}
            <Spline {...props} />
          {/if}
        {/snippet}
      </LineChart>
    {:else}
      <div
        class="flex h-full items-center justify-center text-sm text-gray-400"
      >
        No data available for selected time range
      </div>
    {/if}
  </div>
</div>
