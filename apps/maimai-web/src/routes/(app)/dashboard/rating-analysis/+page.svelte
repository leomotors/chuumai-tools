<script lang="ts">
  import { Activity, Gauge, TrendingUp, Trophy } from "@lucide/svelte";

  import { difficultyColorMap } from "@repo/core/maimai";
  import * as Tabs from "@repo/ui/atom/tabs";

  let { data } = $props();

  let activeTab = $state<"timeline" | "daily">("timeline");

  const analysis = $derived(data.analysis);
  const currentTop = $derived(analysis.highestTimeline.at(-1));
  const timelineIntervals = $derived([...analysis.highestTimeline].reverse());
  const latestGains = $derived(analysis.dailyGains.slice(0, 60));
  const hasOverpower = $derived(
    analysis.dailyGains.some(
      (day) => day.overpowerBefore !== null || day.overpowerAfter !== null,
    ),
  );
  const maxPositiveRoi = $derived(
    Math.max(0, ...analysis.dailyGains.map((day) => day.roi ?? 0)),
  );

  function imageUrl(image: string | null | undefined) {
    return image ? `/api/imageProxy?img=${image}` : "/placeholder.svg";
  }

  function difficultyLabel(difficulty: string | null | undefined) {
    if (difficulty === "remaster") return "Re:MASTER";
    return difficulty ? difficulty.toUpperCase() : "--";
  }

  function difficultyClass(difficulty: string | null | undefined) {
    if (difficulty === "utage") return "bg-pink-500 text-white";
    return (
      Object.entries(difficultyColorMap).find(
        ([key]) => key === difficulty,
      )?.[1] ?? "bg-gray-800 text-white"
    );
  }

  function chartTypeLabel(chartLabel: string | null | undefined) {
    return chartLabel?.split(" ")[0]?.toUpperCase() ?? "--";
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
    return value === null ? "--" : Math.round(value).toLocaleString();
  }

  function formatContributionRating(value: number | null) {
    return value === null ? "Outside rating list" : formatRating(value);
  }

  function formatScore(value: number | null) {
    return value === null
      ? "Outside rating list"
      : `${(value / 10_000).toFixed(4)}%`;
  }

  function formatDelta(value: number | null) {
    if (value === null) return "--";
    const sign = value > 0 ? "+" : "";
    return `${sign}${Math.round(value).toLocaleString()}`;
  }

  function formatInteger(value: number | null) {
    if (value === null) return "--";
    return value.toLocaleString();
  }

  function formatOverpower(value: number | null) {
    if (value === null) return "--";
    return value.toFixed(2);
  }

  function formatRoi(value: number | null) {
    if (value === null) return "--";
    return value.toFixed(2);
  }

  function roiBackground(value: number | null) {
    if (value === null || maxPositiveRoi <= 0) {
      return "linear-gradient(135deg, #f8fafc, #e5e7eb)";
    }

    const ratio = Math.max(0, Math.min(1, value / maxPositiveRoi));
    const hue = Math.round(18 + ratio * 132);
    return `linear-gradient(135deg, hsl(${hue} 78% 90%), hsl(${hue} 72% 78%))`;
  }
</script>

<section class="space-y-4">
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
                  class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                >
                  {chartTypeLabel(currentTop.chartLabel)}
                </span>
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

    <Tabs.Root bind:value={activeTab} class="space-y-4">
      <Tabs.List
        class="grid h-10 w-full grid-cols-2 bg-gray-100 p-1 text-gray-500 sm:w-[360px]"
      >
        <Tabs.Trigger value="timeline" class="gap-2">
          <Trophy class="size-4" />
          Timeline
        </Tabs.Trigger>
        <Tabs.Trigger value="daily" class="gap-2">
          <Activity class="size-4" />
          Daily
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="timeline" class="mt-0">
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
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead
                class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500"
              >
                <tr>
                  <th class="px-4 py-3">Song</th>
                  <th class="px-4 py-3">Score</th>
                  <th class="px-4 py-3">Rating</th>
                  <th class="px-4 py-3">Start</th>
                  <th class="px-4 py-3">End</th>
                  <th class="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                {#each timelineIntervals as interval (interval.id)}
                  <tr class="align-top">
                    <td class="px-4 py-3">
                      <div class="flex min-w-72 items-center gap-3">
                        <div
                          class="size-14 shrink-0 overflow-hidden rounded-md bg-gray-100"
                        >
                          <img
                            src={imageUrl(interval.image)}
                            alt={interval.title}
                            class="size-full object-cover"
                          />
                        </div>
                        <div class="min-w-0">
                          <div class="truncate font-semibold text-gray-950">
                            {interval.title}
                          </div>
                          <div class="mt-1 flex flex-wrap items-center gap-1">
                            <span
                              class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                            >
                              {chartTypeLabel(interval.chartLabel)}
                            </span>
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
                      </div>
                    </td>
                    <td class="px-4 py-3 tabular-nums">
                      {formatScore(interval.score)}
                    </td>
                    <td class="px-4 py-3 tabular-nums">
                      {formatRating(interval.rating)}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      {formatDate(interval.startAt)}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      {interval.endAt ? formatDate(interval.endAt) : "Present"}
                    </td>
                    <td
                      class="px-4 py-3 whitespace-nowrap font-medium text-gray-900"
                    >
                      {formatDuration(interval.durationMs)}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>
      </Tabs.Content>

      <Tabs.Content value="daily" class="mt-0">
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
                  class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <h3 class="text-sm font-semibold text-gray-950">
                      {formatDay(day.date)}
                    </h3>
                    <p class="mt-1 text-xs text-gray-500">Job #{day.jobId}</p>
                  </div>
                  <div
                    class="rounded-lg border border-gray-200 px-3 py-2 text-right shadow-sm"
                    style={`background: ${roiBackground(day.roi)}`}
                  >
                    <div class="text-xs font-semibold text-gray-600">ROI</div>
                    <div class="text-lg font-bold text-gray-950">
                      {formatRoi(day.roi)}
                    </div>
                  </div>
                </div>

                <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div
                    class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div class="text-xs font-medium text-gray-500">
                      Play Count
                    </div>
                    <div class="mt-1 text-base font-semibold text-gray-950">
                      {formatInteger(day.playCountGain)}
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                      {formatInteger(day.playCountBefore)} ->
                      {formatInteger(day.playCountAfter)}
                    </div>
                  </div>
                  <div
                    class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div class="text-xs font-medium text-gray-500">Rating</div>
                    <div
                      class="mt-1 text-base font-semibold {day.gain >= 0
                        ? 'text-emerald-700'
                        : 'text-rose-700'}"
                    >
                      {formatDelta(day.gain)}
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                      {formatRating(day.ratingBefore)} ->
                      {formatRating(day.ratingAfter)}
                    </div>
                  </div>
                  {#if hasOverpower}
                    <div
                      class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div class="text-xs font-medium text-gray-500">
                        Overpower
                      </div>
                      <div
                        class="mt-1 text-base font-semibold {day.overpowerGain ===
                          null || day.overpowerGain >= 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'}"
                      >
                        {formatDelta(day.overpowerGain)}
                      </div>
                      <div class="mt-1 text-xs text-gray-500">
                        {formatOverpower(day.overpowerBefore)} ->
                        {formatOverpower(day.overpowerAfter)}
                      </div>
                    </div>
                  {/if}
                </div>

                {#if day.contributions.length > 0}
                  <div class="mt-3 grid gap-2 lg:grid-cols-2">
                    {#each day.contributions.slice(0, 8) as contribution (`${day.dayKey}-${contribution.recordKey}-${contribution.slot}`)}
                      <div
                        class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <div class="flex items-start gap-3">
                          <div
                            class="size-12 shrink-0 overflow-hidden rounded-md bg-gray-100"
                          >
                            <img
                              src={imageUrl(contribution.image)}
                              alt={contribution.title}
                              class="size-full object-cover"
                            />
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-start justify-between gap-3">
                              <div class="min-w-0">
                                <div
                                  class="truncate text-sm font-semibold text-gray-950"
                                >
                                  {contribution.title}
                                </div>
                                <div
                                  class="mt-1 flex flex-wrap items-center gap-1"
                                >
                                  <span
                                    class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                                  >
                                    {chartTypeLabel(contribution.chartLabel)}
                                  </span>
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
                                {contribution.attribution === "matched"
                                  ? "played"
                                  : "snapshot"}
                              </span>
                            </div>
                            <div
                              class="mt-2 grid gap-1 text-xs text-gray-600 sm:grid-cols-2"
                            >
                              <div>
                                <span class="font-medium text-gray-500"
                                  >Score</span
                                >
                                <span class="ml-1 tabular-nums">
                                  {formatScore(contribution.previousScore)} ->
                                  {formatScore(contribution.score)}
                                </span>
                              </div>
                              <div>
                                <span class="font-medium text-gray-500"
                                  >Rating</span
                                >
                                <span class="ml-1 tabular-nums">
                                  {formatContributionRating(
                                    contribution.previousRating,
                                  )} ->
                                  {formatContributionRating(
                                    contribution.rating,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="mt-3 text-xs text-gray-500">
                    No changed rating records.
                  </p>
                {/if}
              </article>
            {/each}
          </div>
        </section>
      </Tabs.Content>
    </Tabs.Root>
  {/if}
</section>
