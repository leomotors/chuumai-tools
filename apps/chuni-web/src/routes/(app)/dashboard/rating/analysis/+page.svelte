<script lang="ts">
  import {
    ChevronDown,
    CircleDashed,
    Clock,
    Gamepad2,
    Gauge,
    Sparkles,
    TrendingUp,
    Trophy,
    Zap,
  } from "@lucide/svelte";

  import { page } from "$app/state";

  import { difficultyColorMap } from "@repo/core/chuni";
  import type { RatingAnalysisDailyContribution } from "@repo/core/web";

  let { data } = $props();

  const view = $derived(
    page.url.searchParams.get("view") === "timeline" ? "timeline" : "daily",
  );

  const analysis = $derived(data.analysis);
  const currentTop = $derived(analysis.highestTimeline.at(-1));
  const timelineIntervals = $derived([...analysis.highestTimeline].reverse());
  const latestGains = $derived(analysis.dailyGains.slice(0, 60));
  const hasOverpower = $derived(
    analysis.dailyGains.some(
      (day) => day.overpowerBefore !== null || day.overpowerAfter !== null,
    ),
  );
  // Scale the ROI heat map to the 90th percentile of positive days so a single
  // outlier (e.g. the huge gain right after a rating reset) doesn't flatten the
  // color range for every normal day.
  const roiScaleMax = $derived.by(() => {
    const positives = analysis.dailyGains
      .map((day) => day.roi)
      .filter((roi): roi is number => roi !== null && roi > 0)
      .sort((a, b) => a - b);
    if (positives.length === 0) return 0;
    const index = Math.floor((positives.length - 1) * 0.9);
    return positives[index];
  });

  function imageUrl(image: string | null | undefined) {
    return image ? `/api/imageProxy?img=${image}` : "/placeholder.svg";
  }

  function difficultyLabel(difficulty: string | null | undefined) {
    return difficulty ? difficulty.toUpperCase() : "WORLD'S END";
  }

  function difficultyClass(difficulty: string | null | undefined) {
    return (
      Object.entries(difficultyColorMap).find(
        ([key]) => key === difficulty,
      )?.[1] ?? "bg-gray-800 text-white"
    );
  }

  function levelLabel(level: string | null | undefined) {
    return level ? `LV ${level}` : "LV ?";
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDay(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDuration(ms: number) {
    if (ms <= 0) return "same day";
    const days = Math.floor(ms / 86_400_000);
    if (days < 1) return "<1 day";
    if (days < 60) return `${days}d`;
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return remainingDays > 0 ? `${months}mo ${remainingDays}d` : `${months}mo`;
  }

  function formatRating(value: number | null) {
    if (value === null) return "--";
    const rounded = Math.round(value * 100) / 100;
    return Math.abs(value - rounded) < 1e-9
      ? value.toFixed(2)
      : value.toFixed(4);
  }

  function formatContributionRating(value: number | null) {
    return value === null ? "Outside rating list" : formatRating(value);
  }

  function formatScore(value: number | null) {
    return value === null ? "Outside rating list" : value.toLocaleString();
  }

  function formatDelta(value: number | null) {
    if (value === null) return "--";
    const sign = value > 0 ? "+" : "";
    return `${sign}${formatRating(value)}`;
  }

  function formatInteger(value: number | null) {
    if (value === null) return "--";
    return value.toLocaleString();
  }

  function formatRoi(value: number | null) {
    if (value === null || value < 0) return "--";
    return value.toFixed(4);
  }

  function roiBackground(value: number | null) {
    if (value === null || value < 0 || roiScaleMax <= 0) {
      return "linear-gradient(135deg, #f8fafc, #e5e7eb)";
    }

    const ratio = Math.max(0, Math.min(1, value / roiScaleMax));
    const hue = Math.round(18 + ratio * 132);
    return `linear-gradient(135deg, hsl(${hue} 78% 90%), hsl(${hue} 72% 78%))`;
  }
</script>

<section class="space-y-4">
  {#snippet outsideMark()}
    <span
      title="Outside rating list"
      class="inline-flex align-middle text-gray-400"
    >
      <CircleDashed class="size-3.5" />
    </span>
  {/snippet}

  {#snippet briefTile(contribution: RatingAnalysisDailyContribution)}
    <div
      class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white py-1 pr-2 pl-1 shadow-sm"
    >
      <div class="size-9 shrink-0 overflow-hidden rounded bg-gray-100">
        <img
          src={imageUrl(contribution.image)}
          alt={contribution.title}
          class="size-full object-cover"
        />
      </div>
      <span
        class="flex items-center gap-0.5 text-sm font-bold tabular-nums {contribution.delta >=
        0
          ? 'text-emerald-700'
          : 'text-rose-700'}"
      >
        {#if contribution.previousRating === null}
          <Sparkles class="size-3" />
        {/if}
        {formatDelta(contribution.delta)}
      </span>
    </div>
  {/snippet}

  {#snippet recordCard(contribution: RatingAnalysisDailyContribution)}
    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div class="flex items-start gap-3">
        <div class="size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
          <img
            src={imageUrl(contribution.image)}
            alt={contribution.title}
            class="size-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold text-gray-950">
                {contribution.title}
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-1">
                <span
                  class="rounded px-1.5 py-0.5 text-[10px] font-bold text-white {difficultyClass(
                    contribution.difficulty,
                  )}"
                >
                  {difficultyLabel(contribution.difficulty)}
                </span>
                <span
                  class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                >
                  {levelLabel(contribution.level)}
                </span>
              </div>
            </div>
            <span
              class="rounded-md px-2 py-1 text-xs font-semibold {contribution.attribution ===
              'matched'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-200 text-gray-700'}"
            >
              {contribution.attribution === "matched" ? "played" : "snapshot"}
            </span>
          </div>
          <div class="mt-2 grid gap-1 text-xs text-gray-600 sm:grid-cols-2">
            <div>
              <span class="font-medium text-gray-500">Score</span>
              <span class="ml-1 tabular-nums">
                {#if contribution.previousScore === null}
                  {@render outsideMark()}
                {:else}
                  {formatScore(contribution.previousScore)}
                {/if}
                -> {formatScore(contribution.score)}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-500">Rating</span>
              <span class="ml-1 tabular-nums">
                {#if contribution.previousRating === null}
                  {@render outsideMark()}
                {:else}
                  {formatContributionRating(contribution.previousRating)}
                {/if}
                -> {formatContributionRating(contribution.rating)}
              </span>
            </div>
            {#if contribution.previousRating === null}
              <div>
                <span class="font-medium text-gray-500">Floor</span>
                <span class="ml-1 tabular-nums">
                  {#if contribution.replacedFloorRating}
                    {formatRating(contribution.replacedFloorRating)} replaced
                  {:else}
                    {@render outsideMark()} empty slot
                  {/if}
                  <span
                    class="font-semibold {contribution.delta >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'}"
                  >
                    ({formatDelta(contribution.delta)})
                  </span>
                </span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/snippet}

  {#snippet poolBrief(
    label: string,
    accent: string,
    items: RatingAnalysisDailyContribution[],
  )}
    {#if items.length > 0}
      <div class="flex items-center gap-1.5">
        <span
          class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase {accent}"
        >
          {label}
        </span>
        <div class="flex flex-wrap items-center gap-1.5">
          {#each items.slice(0, 8) as contribution (`brief-${contribution.recordKey}-${contribution.slot}`)}
            {@render briefTile(contribution)}
          {/each}
          {#if items.length > 8}
            <span class="text-xs font-medium text-gray-400">
              +{items.length - 8}
            </span>
          {/if}
        </div>
      </div>
    {/if}
  {/snippet}

  {#snippet poolFull(
    label: string,
    accent: string,
    items: RatingAnalysisDailyContribution[],
  )}
    {#if items.length > 0}
      <div class="space-y-2">
        <div class="flex items-center gap-1.5">
          <span
            class="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase {accent}"
          >
            {label}
          </span>
          <span class="text-xs text-gray-400">{items.length}</span>
        </div>
        <div class="grid gap-2 lg:grid-cols-2">
          {#each items as contribution (`${contribution.recordKey}-${contribution.slot}`)}
            {@render recordCard(contribution)}
          {/each}
        </div>
      </div>
    {/if}
  {/snippet}

  <div
    class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
  >
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-2">
          <Gauge class="size-5 text-gray-700" />
          <h1 class="text-lg font-semibold text-gray-950">Rating Analysis</h1>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {analysis.snapshotCount.toLocaleString()} snapshots - computed
          {formatDate(analysis.computedAt)}
        </p>
      </div>
      <div class="text-sm font-semibold text-gray-700">
        Latest job #{analysis.latestJobId ?? "--"}
      </div>
    </div>
  </div>

  {#if analysis.snapshotCount === 0}
    <div
      class="rounded-xl border border-gray-200/70 bg-white px-5 py-8 text-center shadow-sm"
    >
      <h2 class="text-sm font-semibold text-gray-900">No rating data yet</h2>
      <p class="mt-1 text-xs text-gray-500">
        Rating analysis appears after the first completed scrape job.
      </p>
    </div>
  {:else}
    <div class="grid gap-3 md:grid-cols-3">
      <div
        class="rounded-xl border border-gray-200/70 bg-white px-4 py-3 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="size-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
            <img
              src={imageUrl(currentTop?.image)}
              alt={currentTop?.title ?? "Top holder"}
              class="size-full object-cover"
            />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-medium text-gray-500">Top holder</div>
            <div class="mt-1 truncate text-base font-semibold text-gray-950">
              {currentTop?.title ?? "--"}
            </div>
            {#if currentTop}
              <div class="mt-2 flex flex-wrap items-center gap-1">
                <span
                  class="rounded px-1.5 py-0.5 text-[10px] font-bold text-white {difficultyClass(
                    currentTop.difficulty,
                  )}"
                >
                  {difficultyLabel(currentTop.difficulty)}
                </span>
                <span
                  class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                >
                  {levelLabel(currentTop.level)}
                </span>
              </div>
            {:else}
              <div class="mt-1 text-xs text-gray-500">--</div>
            {/if}
          </div>
        </div>
      </div>
      <div
        class="rounded-xl border border-gray-200/70 bg-white px-4 py-3 shadow-sm"
      >
        <div class="text-xs font-medium text-gray-500">Tracked charts</div>
        <div class="mt-1 text-2xl font-bold text-gray-950">
          {analysis.songDurations.length.toLocaleString()}
        </div>
      </div>
      <div
        class="rounded-xl border border-gray-200/70 bg-white px-4 py-3 shadow-sm"
      >
        <div class="text-xs font-medium text-gray-500">Active days</div>
        <div class="mt-1 text-2xl font-bold text-gray-950">
          {analysis.dailyGains.length.toLocaleString()}
        </div>
      </div>
    </div>

    <div class="space-y-4">
      {#if view === "timeline"}
        <section
          class="rounded-xl border border-gray-200/70 bg-white shadow-sm"
        >
          <div
            class="flex items-center gap-2 border-b border-gray-200/70 px-5 py-4"
          >
            <Trophy class="size-5 text-gray-700" />
            <h2 class="text-base font-semibold text-gray-950">
              Highest Rating Timeline
            </h2>
          </div>
          {#if timelineIntervals.length === 0}
            <p class="px-5 py-8 text-center text-xs text-gray-500">
              No #1 history yet.
            </p>
          {:else}
            <ol class="px-5 py-5">
              {#each timelineIntervals as interval, index (interval.id)}
                <li class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <span
                      class="mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-white {interval.ongoing
                        ? 'bg-emerald-500'
                        : 'bg-gray-300'}"
                    ></span>
                    {#if index < timelineIntervals.length - 1}
                      <span class="w-px grow bg-gray-200"></span>
                    {/if}
                  </div>
                  <div
                    class="min-w-0 flex-1 {index < timelineIntervals.length - 1
                      ? 'pb-6'
                      : ''}"
                  >
                    <div
                      class="rounded-lg border p-3 shadow-sm {interval.ongoing
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-gray-200/70 bg-white'}"
                    >
                      <div
                        class="flex flex-wrap items-center justify-between gap-2"
                      >
                        <div
                          class="flex items-center gap-1.5 text-xs text-gray-500"
                        >
                          <span class="font-medium text-gray-700">
                            {formatDate(interval.startAt)}
                          </span>
                          <span aria-hidden="true">-&gt;</span>
                          <span
                            class="font-medium {interval.ongoing
                              ? 'text-emerald-700'
                              : 'text-gray-700'}"
                          >
                            {interval.endAt
                              ? formatDate(interval.endAt)
                              : "Present"}
                          </span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          {#if interval.ongoing}
                            <span
                              class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
                            >
                              Current #1
                            </span>
                          {/if}
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white"
                          >
                            <Clock class="size-3" />
                            {formatDuration(interval.durationMs)}
                          </span>
                        </div>
                      </div>

                      <div class="mt-3 flex items-center gap-3">
                        <div
                          class="size-14 shrink-0 overflow-hidden rounded-md bg-gray-100"
                        >
                          <img
                            src={imageUrl(interval.image)}
                            alt={interval.title}
                            class="size-full object-cover"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="truncate font-semibold text-gray-950">
                            {interval.title}
                          </div>
                          <div class="mt-1 flex flex-wrap items-center gap-1">
                            <span
                              class="rounded px-1.5 py-0.5 text-[10px] font-bold text-white {difficultyClass(
                                interval.difficulty,
                              )}"
                            >
                              {difficultyLabel(interval.difficulty)}
                            </span>
                            <span
                              class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                            >
                              {levelLabel(interval.level)}
                            </span>
                          </div>
                        </div>
                        <div class="shrink-0 text-right">
                          <div
                            class="text-base font-bold tabular-nums text-gray-950"
                          >
                            {formatRating(interval.rating)}
                          </div>
                          <div class="text-xs tabular-nums text-gray-500">
                            {interval.score.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {#if interval.steps.length > 1}
                        <details
                          class="group mt-3 border-t border-gray-200/70 pt-2"
                        >
                          <summary
                            class="flex cursor-pointer list-none items-center gap-1.5 text-xs text-gray-500 [&::-webkit-details-marker]:hidden"
                          >
                            <ChevronDown
                              class="size-3.5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                            />
                            <span class="font-medium text-gray-700">Score</span>
                            <span class="tabular-nums">
                              {interval.steps[0].score.toLocaleString()} -&gt;
                              {interval.score.toLocaleString()}
                            </span>
                            <span class="text-gray-400">
                              · {interval.steps.length} steps
                            </span>
                          </summary>
                          <ol class="mt-2 space-y-1">
                            {#each interval.steps as step (step.startJobId)}
                              <li
                                class="rounded-md bg-gray-50 px-2 py-1.5 text-xs"
                              >
                                <div
                                  class="flex items-center justify-between gap-2"
                                >
                                  <span
                                    class="font-semibold tabular-nums text-gray-900"
                                  >
                                    {step.score.toLocaleString()}
                                  </span>
                                  <span class="tabular-nums text-gray-500">
                                    {formatRating(step.rating)}
                                  </span>
                                </div>
                                <div
                                  class="mt-0.5 flex items-center justify-between gap-2 text-gray-500"
                                >
                                  <span>
                                    {formatDate(step.startAt)} -&gt;
                                    {step.endAt
                                      ? formatDate(step.endAt)
                                      : "Present"}
                                  </span>
                                  <span class="font-medium text-gray-700">
                                    {formatDuration(step.durationMs)}
                                  </span>
                                </div>
                              </li>
                            {/each}
                          </ol>
                        </details>
                      {/if}
                    </div>
                  </div>
                </li>
              {/each}
            </ol>
          {/if}
        </section>
      {:else}
        <section
          class="rounded-xl border border-gray-200/70 bg-white shadow-sm"
        >
          <div
            class="flex items-center gap-2 border-b border-gray-200/70 px-5 py-4"
          >
            <TrendingUp class="size-5 text-gray-700" />
            <h2 class="text-base font-semibold text-gray-950">
              Daily Performance
            </h2>
          </div>
          <div class="divide-y divide-gray-100">
            {#each latestGains as day (day.dayKey)}
              <article class="px-5 py-4">
                <div
                  class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2"
                >
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 class="text-sm font-semibold text-gray-950">
                        {formatDay(day.date)}
                      </h3>
                      <span class="flex items-center gap-1 text-xs">
                        <Gauge class="size-3.5 text-gray-400" />
                        <span
                          class="font-semibold {day.gain >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-700'}"
                        >
                          {formatDelta(day.gain)}
                        </span>
                        <span class="tabular-nums text-gray-400">
                          {formatRating(day.ratingBefore)} -> {formatRating(
                            day.ratingAfter,
                          )}
                        </span>
                      </span>
                      <span
                        class="flex items-center gap-1 text-xs text-gray-700"
                      >
                        <Gamepad2 class="size-3.5 text-gray-400" />
                        <span class="font-semibold">
                          {formatInteger(day.playCountGain)}
                        </span>
                      </span>
                      {#if hasOverpower}
                        <span class="flex items-center gap-1 text-xs">
                          <Zap class="size-3.5 text-gray-400" />
                          <span
                            class="font-semibold {day.overpowerGain === null ||
                            day.overpowerGain >= 0
                              ? 'text-emerald-700'
                              : 'text-rose-700'}"
                          >
                            {formatDelta(day.overpowerGain)}
                          </span>
                        </span>
                      {/if}
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Job #{day.jobId}</p>
                  </div>
                  <div
                    class="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-right shadow-sm"
                    style={`background: ${roiBackground(day.roi)}`}
                  >
                    <div class="text-xs font-semibold text-gray-600">ROI</div>
                    <div class="text-lg font-bold text-gray-950">
                      {formatRoi(day.roi)}
                    </div>
                  </div>
                </div>

                {#if day.contributions.length > 0}
                  {@const oldPool = day.contributions.filter(
                    (contribution) => contribution.slot === "old",
                  )}
                  {@const newPool = day.contributions.filter(
                    (contribution) => contribution.slot === "new",
                  )}
                  <details
                    class="group mt-3 rounded-lg border border-gray-200/80 bg-gray-50/60 p-2.5"
                  >
                    <summary
                      class="flex cursor-pointer list-none flex-col gap-2 [&::-webkit-details-marker]:hidden"
                    >
                      <div class="flex items-center gap-1.5">
                        <ChevronDown
                          class="size-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                        />
                        <span class="text-xs font-semibold text-gray-700">
                          Rating records
                        </span>
                        <span class="text-xs text-gray-400">
                          {day.contributions.length}
                        </span>
                      </div>
                      <div class="flex flex-col gap-1.5 group-open:hidden">
                        {@render poolBrief(
                          "BEST",
                          "bg-amber-100 text-amber-700",
                          oldPool,
                        )}
                        {@render poolBrief(
                          "CURRENT",
                          "bg-sky-100 text-sky-700",
                          newPool,
                        )}
                      </div>
                    </summary>
                    <div class="mt-3 space-y-3">
                      {@render poolFull(
                        "BEST",
                        "bg-amber-100 text-amber-700",
                        oldPool,
                      )}
                      {@render poolFull(
                        "CURRENT",
                        "bg-sky-100 text-sky-700",
                        newPool,
                      )}
                    </div>
                  </details>
                {:else}
                  <p class="mt-3 text-xs text-gray-500">
                    No changed rating records.
                  </p>
                {/if}
              </article>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  {/if}
</section>
