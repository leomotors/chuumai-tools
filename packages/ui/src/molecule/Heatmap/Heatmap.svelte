<script lang="ts" module>
  import type { Snippet } from "svelte";

  import type { HeatmapDay } from "./utils.js";

  export type HeatmapProps = {
    /** Days in chronological order, one entry per calendar day in the range. */
    days: HeatmapDay[];
    /** Hex color (e.g. "#3b82f6") used for the gradient of normal cells. */
    color: string;
    /** Hex color used for reset days (e.g. rating drops on version bump). */
    resetColor?: string;
    /** Whether to render the "Reset" legend chip. Only applicable when the
     * metric supports resets (e.g. rating). */
    showResetLegend?: boolean;
    /** Heading shown in the header row. */
    title?: string;
    /** Sub-heading shown beneath the title. */
    subtitle?: string;
    /** Tooltip formatter; receives the hovered day. */
    formatTooltip: (day: HeatmapDay) => string;
    /** Optional content rendered below the grid (e.g. summary stats). */
    footer?: Snippet;
  };
</script>

<script lang="ts">
  type DisplayCell = { date: Date; day?: HeatmapDay };

  let {
    days,
    color,
    resetColor = "#ef4444",
    showResetLegend = false,
    title,
    subtitle,
    formatTooltip,
    footer,
  }: HeatmapProps = $props();

  function hexWithAlpha(hex: string, alpha: number): string {
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex}${a}`;
  }

  const grid = $derived.by(() => {
    if (days.length === 0) {
      return { weeks: [] as DisplayCell[][], maxValue: 0 };
    }

    const first = days[0].date;
    const last = days[days.length - 1].date;
    const startDow = first.getDay();
    const endDow = last.getDay();

    const cells: DisplayCell[] = [];
    for (let i = startDow; i > 0; i--) {
      cells.push({
        date: new Date(
          first.getFullYear(),
          first.getMonth(),
          first.getDate() - i,
        ),
      });
    }
    for (const day of days) cells.push({ date: day.date, day });
    for (let i = 1; i <= 6 - endDow; i++) {
      cells.push({
        date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + i),
      });
    }

    let maxValue = 0;
    for (const d of days) {
      if (!d.hasData) continue;
      const abs = Math.abs(d.value);
      if (abs > maxValue) maxValue = abs;
    }

    const weeks: DisplayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return { weeks, maxValue };
  });

  function cellColor(cell: DisplayCell, max: number): string {
    if (!cell.day) return "transparent";
    if (!cell.day.hasData || cell.day.value === 0) return "#f3f4f6";
    if (cell.day.isReset) {
      return hexWithAlpha(resetColor, 0.7);
    }
    const intensity =
      max > 0 ? 0.2 + 0.8 * (Math.abs(cell.day.value) / max) : 0.5;
    return hexWithAlpha(color, intensity);
  }

  let hovered = $state<{ text: string; x: number; y: number } | null>(null);

  function showTooltip(e: PointerEvent, day: HeatmapDay | undefined) {
    if (!day) return;
    hovered = { text: formatTooltip(day), x: e.clientX, y: e.clientY };
  }

  function moveTooltip(e: PointerEvent) {
    if (!hovered) return;
    hovered = { ...hovered, x: e.clientX, y: e.clientY };
  }

  function hideTooltip() {
    hovered = null;
  }

  const monthLabels = $derived(
    grid.weeks.map((week) => {
      const firstWithData = week.find((c) => c.day);
      if (!firstWithData) return "";
      const dom = firstWithData.date.getDate();
      if (dom <= 7) {
        return firstWithData.date.toLocaleDateString("en-US", {
          month: "short",
        });
      }
      return "";
    }),
  );
</script>

{#if days.length > 0}
  <div>
    {#if title || subtitle}
      <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          {#if title}
            <h3 class="text-[15px] font-semibold tracking-tight text-gray-900">
              {title}
            </h3>
          {/if}
          {#if subtitle}
            <p class="mt-0.5 text-[11.5px] text-gray-400">{subtitle}</p>
          {/if}
        </div>
        <div
          class="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400"
        >
          <span>Less</span>
          <div class="size-3 rounded-sm" style:background-color="#f3f4f6"></div>
          {#each [0.25, 0.5, 0.75, 1] as step (step)}
            <div
              class="size-3 rounded-sm"
              style:background-color={hexWithAlpha(color, 0.2 + 0.8 * step)}
            ></div>
          {/each}
          <span>More</span>
          {#if showResetLegend}
            <span class="ml-2 flex items-center gap-1">
              <div
                class="size-3 rounded-sm"
                style:background-color={hexWithAlpha(resetColor, 0.7)}
              ></div>
              Reset
            </span>
          {/if}
        </div>
      </div>
    {/if}

    <div class="overflow-x-auto">
      <div class="inline-flex min-w-fit flex-col gap-1">
        <div class="flex gap-[3px] pl-7">
          {#each monthLabels as mLabel, i (i)}
            <div class="w-3 text-[10px] leading-none text-gray-500">
              {mLabel}
            </div>
          {/each}
        </div>
        <div class="flex gap-1">
          <div
            class="flex flex-col gap-[3px] pr-1 text-[10px] text-gray-500 select-none"
          >
            {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as dow, i (dow)}
              <div
                class="h-3 leading-3"
                style:visibility={i % 2 === 1 ? "visible" : "hidden"}
              >
                {dow}
              </div>
            {/each}
          </div>
          <div class="flex gap-[3px]">
            {#each grid.weeks as week, wi (wi)}
              <div class="flex flex-col gap-[3px]">
                {#each week as cell (cell.date.getTime())}
                  <div
                    class="size-3 rounded-sm"
                    style:background-color={cellColor(cell, grid.maxValue)}
                    role={cell.day ? "img" : undefined}
                    aria-label={cell.day ? formatTooltip(cell.day) : undefined}
                    onpointerenter={(e) => showTooltip(e, cell.day)}
                    onpointermove={moveTooltip}
                    onpointerleave={hideTooltip}
                  ></div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    {#if footer}
      <div
        class="mt-3.5 flex flex-wrap gap-7 border-t border-gray-200/50 pt-3.5 text-[12px] text-gray-500"
      >
        {@render footer()}
      </div>
    {/if}
  </div>
{/if}

{#if hovered}
  <div
    class="pointer-events-none fixed z-50 rounded-md bg-gray-900 px-2 py-1 text-[11px] whitespace-nowrap text-white shadow-lg"
    style:left="{hovered.x + 12}px"
    style:top="{hovered.y + 12}px"
  >
    {hovered.text}
  </div>
{/if}
