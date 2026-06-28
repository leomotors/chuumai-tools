<script lang="ts" module>
  export type RatingListTimelineStep = {
    slot: "old" | "new";
    score: number;
    rating: number;
    startAt: string;
    endAt: string | null;
    durationMs: number;
  };

  export type RatingListTimelineSpan = {
    slot: "old" | "new";
    score: number;
    rating: number;
    startAt: string;
    endAt: string | null;
    durationMs: number;
    ongoing: boolean;
    steps: RatingListTimelineStep[];
  };

  export type RatingListTopTimelineSpan = {
    score: number;
    rating: number;
    startAt: string;
    endAt: string | null;
    durationMs: number;
    ongoing: boolean;
  };

  export type RatingListTimelinePanelProps = {
    contributionIntervals: RatingListTimelineSpan[];
    topIntervals: RatingListTopTimelineSpan[];
    computedAt: string;
    poolLabels: { old: string; new: string };
    isCurrentTop?: boolean;
    isCurrentContributor?: boolean;
  };
</script>

<script lang="ts">
  import { ChevronDown, Crown, TrendingUp } from "@lucide/svelte";

  import * as Tooltip from "@repo/ui/atom/tooltip";

  let {
    contributionIntervals,
    topIntervals,
    computedAt,
    poolLabels,
    isCurrentTop = false,
    isCurrentContributor = false,
  }: RatingListTimelinePanelProps = $props();

  type LayoutSpan<T> = T & { leftPercent: number; widthPercent: number };

  type TimelineMarker = {
    id: string;
    leftPercent: number;
    variant: "start" | "end" | "ongoing";
    dateLabel: string;
    eventLabel: string;
  };

  type TrackTone = "old" | "new" | "top";

  const LABEL_WIDTH = "4.75rem";

  function formatDuration(ms: number) {
    if (ms <= 0) return "same day";
    const days = Math.floor(ms / 86_400_000);
    if (days < 1) return "<1 day";
    if (days < 60) return `${days} days`;
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) return `${months} mo`;
    return `${months} mo ${remainingDays} d`;
  }

  function formatShortDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatRating(value: number) {
    const rounded = Math.round(value * 100) / 100;
    return Math.abs(value - rounded) < 1e-9
      ? value.toFixed(2)
      : value.toFixed(4);
  }

  function formatScore(value: number) {
    return value.toLocaleString();
  }

  function formatRange(
    startAt: string,
    endAt: string | null,
    ongoing: boolean,
  ) {
    const endLabel = ongoing || !endAt ? "Present" : formatShortDate(endAt);
    return `${formatShortDate(startAt)} – ${endLabel}`;
  }

  function scoreRangeLabel(steps: RatingListTimelineStep[]) {
    if (steps.length <= 1) return formatScore(steps[0]?.score ?? 0);
    const first = steps[0]?.score ?? 0;
    const last = steps[steps.length - 1]?.score ?? first;
    return first === last
      ? formatScore(first)
      : `${formatScore(first)} → ${formatScore(last)}`;
  }

  function poolLabel(steps: RatingListTimelineStep[]) {
    const slots = [...new Set(steps.map((step) => step.slot))];
    if (slots.length === 1) {
      return slots[0] === "old" ? poolLabels.old : poolLabels.new;
    }
    if (slots.length > 1) {
      return `${poolLabels.old} → ${poolLabels.new}`;
    }
    return poolLabels.old;
  }

  function poolBadgeClass(steps: RatingListTimelineStep[]) {
    const slots = [...new Set(steps.map((step) => step.slot))];
    if (slots.length === 1 && slots[0] === "new") {
      return "bg-sky-100 text-sky-800";
    }
    if (slots.length > 1) {
      return "bg-violet-100 text-violet-800";
    }
    return "bg-amber-100 text-amber-800";
  }

  function spanEndMs(endAt: string | null, rangeEndMs: number) {
    return endAt ? new Date(endAt).getTime() : rangeEndMs;
  }

  function layoutOnAxis<T extends { startAt: string; endAt: string | null }>(
    spans: T[],
    rangeStartMs: number,
    rangeEndMs: number,
  ): LayoutSpan<T>[] {
    const totalMs = Math.max(rangeEndMs - rangeStartMs, 1);

    return spans.map((span) => {
      const startMs = new Date(span.startAt).getTime();
      const endMs = spanEndMs(span.endAt, rangeEndMs);
      const widthMs = Math.max(endMs - startMs, 0);

      return {
        ...span,
        leftPercent: ((startMs - rangeStartMs) / totalMs) * 100,
        widthPercent: (widthMs / totalMs) * 100,
      };
    });
  }

  function toneLineClass(tone: TrackTone) {
    if (tone === "old") return "bg-amber-500";
    if (tone === "new") return "bg-sky-500";
    return "bg-emerald-500";
  }

  function toneFillClass(tone: TrackTone) {
    if (tone === "old") return "bg-amber-500";
    if (tone === "new") return "bg-sky-500";
    return "bg-emerald-500";
  }

  function toneRingClass(tone: TrackTone) {
    if (tone === "old") return "border-amber-500";
    if (tone === "new") return "border-sky-500";
    return "border-emerald-500";
  }

  function toneArrowClass(tone: TrackTone) {
    if (tone === "old") return "border-l-amber-500";
    if (tone === "new") return "border-l-sky-500";
    return "border-l-emerald-500";
  }

  function poolStepStartLabel(
    span: RatingListTimelineStep,
    poolName: string,
    previous: LayoutSpan<RatingListTimelineStep> | undefined,
  ) {
    const detail = `${formatScore(span.score)} (${formatRating(span.rating)})`;
    if (!previous) {
      return `Entered ${poolName} at ${detail}`;
    }
    if (previous.endAt !== span.startAt) {
      return `Back on ${poolName} at ${detail}`;
    }
    if (previous.score !== span.score) {
      return `Score updated to ${detail}`;
    }
    return `Continued in ${poolName} at ${detail}`;
  }

  function poolStepEndLabel(
    span: LayoutSpan<RatingListTimelineStep>,
    poolName: string,
    next: LayoutSpan<RatingListTimelineStep> | undefined,
  ) {
    if (next && next.startAt === span.endAt && next.score !== span.score) {
      return `Held ${formatScore(span.score)} until score updated`;
    }
    if (next && next.startAt === span.endAt) {
      return `Still on ${poolName}`;
    }
    return `Left ${poolName}`;
  }

  function topStepStartLabel(
    span: RatingListTopTimelineSpan,
    previous: LayoutSpan<RatingListTopTimelineSpan> | undefined,
  ) {
    const detail = `${formatScore(span.score)} (${formatRating(span.rating)})`;
    if (!previous) {
      return `Reached #1 at ${detail}`;
    }
    if (previous.endAt !== span.startAt) {
      return `Regained #1 at ${detail}`;
    }
    if (previous.score !== span.score) {
      return `#1 score updated to ${detail}`;
    }
    return `Regained #1 at ${detail}`;
  }

  function topStepEndLabel(
    span: LayoutSpan<RatingListTopTimelineSpan>,
    next: LayoutSpan<RatingListTopTimelineSpan> | undefined,
  ) {
    if (next && next.startAt === span.endAt && next.score !== span.score) {
      return `Held #1 at ${formatScore(span.score)} until score updated`;
    }
    if (next && next.startAt === span.endAt) {
      return "Still #1";
    }
    return "No longer #1";
  }

  function markersForPoolSteps(
    spans: LayoutSpan<RatingListTimelineStep>[],
    poolName: string,
  ): TimelineMarker[] {
    const markers: TimelineMarker[] = [];

    for (const [index, span] of spans.entries()) {
      const previous = index > 0 ? spans[index - 1] : undefined;
      const next = spans[index + 1];

      markers.push({
        id: `${span.startAt}-${poolName}-start`,
        leftPercent: span.leftPercent,
        variant: "start",
        dateLabel: formatDateTime(span.startAt),
        eventLabel: poolStepStartLabel(span, poolName, previous),
      });

      if (span.endAt) {
        markers.push({
          id: `${span.startAt}-${poolName}-end`,
          leftPercent: span.leftPercent + span.widthPercent,
          variant: "end",
          dateLabel: formatDateTime(span.endAt),
          eventLabel: poolStepEndLabel(span, poolName, next),
        });
      } else {
        markers.push({
          id: `${span.startAt}-${poolName}-ongoing`,
          leftPercent: span.leftPercent + span.widthPercent,
          variant: "ongoing",
          dateLabel: "Present",
          eventLabel: `Still in ${poolName} at ${formatScore(span.score)} (${formatRating(span.rating)})`,
        });
      }
    }

    return markers;
  }

  function markersForTopSpans(
    spans: LayoutSpan<RatingListTopTimelineSpan>[],
  ): TimelineMarker[] {
    const markers: TimelineMarker[] = [];

    for (const [index, span] of spans.entries()) {
      const previous = index > 0 ? spans[index - 1] : undefined;
      const next = spans[index + 1];

      markers.push({
        id: `${span.startAt}-top-start`,
        leftPercent: span.leftPercent,
        variant: "start",
        dateLabel: formatDateTime(span.startAt),
        eventLabel: topStepStartLabel(span, previous),
      });

      if (span.endAt) {
        markers.push({
          id: `${span.startAt}-top-end`,
          leftPercent: span.leftPercent + span.widthPercent,
          variant: "end",
          dateLabel: formatDateTime(span.endAt),
          eventLabel: topStepEndLabel(span, next),
        });
      } else {
        markers.push({
          id: `${span.startAt}-top-ongoing`,
          leftPercent: span.leftPercent + span.widthPercent,
          variant: "ongoing",
          dateLabel: "Present",
          eventLabel: `Still #1 at ${formatScore(span.score)} (${formatRating(span.rating)})`,
        });
      }
    }

    return markers;
  }

  const hasData = $derived(
    contributionIntervals.length > 0 || topIntervals.length > 0,
  );

  const chronologicalIntervals = $derived(
    [...contributionIntervals].sort((a, b) =>
      a.startAt.localeCompare(b.startAt),
    ),
  );

  const displayIntervals = $derived(
    [...contributionIntervals].sort((a, b) =>
      b.startAt.localeCompare(a.startAt),
    ),
  );

  const globalRange = $derived.by(() => {
    const starts = [
      ...contributionIntervals.map((i) => new Date(i.startAt).getTime()),
      ...topIntervals.map((i) => new Date(i.startAt).getTime()),
    ];
    const ends = [
      ...contributionIntervals.map((i) =>
        spanEndMs(i.endAt, new Date(computedAt).getTime()),
      ),
      ...topIntervals.map((i) =>
        spanEndMs(i.endAt, new Date(computedAt).getTime()),
      ),
    ];
    if (starts.length === 0) {
      return {
        startMs: new Date(computedAt).getTime(),
        endMs: new Date(computedAt).getTime(),
      };
    }
    return {
      startMs: Math.min(...starts),
      endMs: Math.max(new Date(computedAt).getTime(), ...ends),
    };
  });

  function stepsForSlot(slot: "old" | "new") {
    const steps: RatingListTimelineStep[] = [];
    for (const interval of chronologicalIntervals) {
      for (const step of interval.steps) {
        if (step.slot === slot) steps.push(step);
      }
    }
    return steps;
  }

  const oldSteps = $derived(
    layoutOnAxis(stepsForSlot("old"), globalRange.startMs, globalRange.endMs),
  );

  const newSteps = $derived(
    layoutOnAxis(stepsForSlot("new"), globalRange.startMs, globalRange.endMs),
  );

  const topSpans = $derived(
    layoutOnAxis(topIntervals, globalRange.startMs, globalRange.endMs),
  );

  const oldMarkers = $derived(markersForPoolSteps(oldSteps, poolLabels.old));
  const newMarkers = $derived(markersForPoolSteps(newSteps, poolLabels.new));
  const topMarkers = $derived(markersForTopSpans(topSpans));

  const totalTrackedMs = $derived(
    contributionIntervals.reduce(
      (sum, interval) => sum + interval.durationMs,
      0,
    ),
  );
</script>

{#if !hasData}
  <p class="py-8 text-center text-sm text-gray-500">
    Not seen in Music for Rating snapshots yet.
  </p>
{:else}
  <div class="space-y-5">
    <div class="flex flex-wrap gap-2 text-xs text-gray-500">
      <span
        class="rounded-full border border-gray-200 bg-white px-2.5 py-1 tabular-nums"
      >
        {formatDuration(totalTrackedMs)} on list
      </span>
      <span class="rounded-full border border-gray-200 bg-white px-2.5 py-1">
        {contributionIntervals.length} stint{contributionIntervals.length === 1
          ? ""
          : "s"}
      </span>
      {#if isCurrentContributor}
        <span
          class="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-700"
        >
          In list
        </span>
      {/if}
      {#if isCurrentTop}
        <span
          class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"
        >
          Current #1
        </span>
      {/if}
    </div>

    <div
      class="rounded-xl border border-gray-200/70 bg-white px-4 py-4 shadow-sm sm:px-5"
    >
      <div
        class="mb-4 flex items-center justify-between gap-2 text-xs text-gray-500"
      >
        <span
          >{formatShortDate(new Date(globalRange.startMs).toISOString())}</span
        >
        <span>{formatShortDate(computedAt)}</span>
      </div>

      <Tooltip.Provider delayDuration={120}>
        <div class="space-y-4">
          {#snippet axisTrack(
            label: string,
            spans: Array<
              LayoutSpan<{
                startAt: string;
                endAt: string | null;
              }>
            >,
            markers: TimelineMarker[],
            tone: TrackTone,
            showCrown = false,
          )}
            {#if spans.length > 0}
              <div
                class="grid items-center gap-x-3"
                style:grid-template-columns="{LABEL_WIDTH} 1fr"
              >
                <span
                  class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide {tone ===
                  'old'
                    ? 'text-amber-800'
                    : tone === 'new'
                      ? 'text-sky-800'
                      : 'text-emerald-800'}"
                >
                  {#if showCrown}
                    <Crown class="size-3" />
                  {/if}
                  {label}
                </span>

                <div class="relative h-5">
                  <div
                    class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200"
                  ></div>

                  {#each spans as span (span.startAt + tone + String(span.leftPercent))}
                    <div
                      class="absolute top-1/2 h-0.5 -translate-y-1/2 {toneLineClass(
                        tone,
                      )}"
                      style:left="{span.leftPercent}%"
                      style:width="{Math.max(span.widthPercent, 0.4)}%"
                    ></div>
                  {/each}

                  {#each markers as marker (marker.id)}
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        {#snippet child({ props })}
                          {#if marker.variant === "ongoing"}
                            <button
                              type="button"
                              class="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-default p-1"
                              style:left="{marker.leftPercent}%"
                              aria-label="{marker.dateLabel}. {marker.eventLabel}"
                              {...props}
                            >
                              <span
                                class="block size-0 border-y-[4px] border-l-[6px] border-y-transparent {toneArrowClass(
                                  tone,
                                )}"
                              ></span>
                            </button>
                          {:else}
                            <button
                              type="button"
                              class="absolute top-1/2 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-default rounded-full ring-2 ring-white {marker.variant ===
                              'start'
                                ? toneFillClass(tone)
                                : `border-2 bg-white ${toneRingClass(tone)}`}"
                              style:left="{marker.leftPercent}%"
                              aria-label="{marker.dateLabel}. {marker.eventLabel}"
                              {...props}
                            ></button>
                          {/if}
                        {/snippet}
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        class="block max-w-none rounded-lg border border-gray-200/50 bg-white/95 px-3 py-2 text-left whitespace-nowrap shadow-md backdrop-blur-md"
                        arrowClasses="bg-white fill-white"
                      >
                        <p class="text-sm text-gray-900">
                          <span class="font-semibold">{marker.dateLabel}</span>
                          <span class="mx-1.5 text-gray-300">·</span>
                          <span class="text-gray-600">{marker.eventLabel}</span>
                        </p>
                      </Tooltip.Content>
                    </Tooltip.Root>
                  {/each}
                </div>
              </div>
            {/if}
          {/snippet}

          {@render axisTrack(poolLabels.old, oldSteps, oldMarkers, "old")}
          {@render axisTrack(poolLabels.new, newSteps, newMarkers, "new")}
          {@render axisTrack("#1", topSpans, topMarkers, "top", true)}
        </div>
      </Tooltip.Provider>
    </div>

    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-800">Periods</h3>
      <ol class="space-y-0">
        {#each displayIntervals as interval, index (interval.startAt + String(index))}
          <li class="flex gap-3">
            <div class="flex flex-col items-center pt-3.5">
              <span
                class="size-2 shrink-0 rounded-full ring-4 ring-white {interval.ongoing
                  ? 'bg-gray-700'
                  : 'bg-gray-300'}"
              ></span>
              {#if index < displayIntervals.length - 1}
                <span class="w-px grow bg-gray-200"></span>
              {/if}
            </div>

            <div
              class="min-w-0 flex-1 {index < displayIntervals.length - 1
                ? 'pb-4'
                : ''}"
            >
              <div
                class="rounded-lg border border-gray-200/70 bg-white px-3.5 py-3 shadow-sm"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0 space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase {poolBadgeClass(
                          interval.steps,
                        )}"
                      >
                        {poolLabel(interval.steps)}
                      </span>
                      {#if interval.ongoing}
                        <span
                          class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
                        >
                          Active
                        </span>
                      {/if}
                    </div>
                    <div class="text-sm font-semibold text-gray-900">
                      {formatRange(
                        interval.startAt,
                        interval.endAt,
                        interval.ongoing,
                      )}
                    </div>
                    <div class="text-xs text-gray-500">
                      <span class="font-medium tabular-nums text-gray-800">
                        {scoreRangeLabel(interval.steps)}
                      </span>
                      · {formatRating(interval.rating)} rating · {formatDuration(
                        interval.durationMs,
                      )}
                    </div>
                  </div>
                </div>

                {#if interval.steps.length > 1}
                  <details class="group mt-2.5">
                    <summary
                      class="flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100/80"
                    >
                      <TrendingUp class="size-3.5 text-gray-500" />
                      {interval.steps.length} updates
                      <ChevronDown
                        class="ml-auto size-3.5 text-gray-400 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div class="mt-2 space-y-1">
                      {#each [...interval.steps].reverse() as step (step.startAt + step.slot + step.score)}
                        <div
                          class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs"
                        >
                          <div class="flex flex-wrap items-center gap-2">
                            <span
                              class="rounded px-1 py-0.5 text-[10px] font-bold uppercase {step.slot ===
                              'old'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'}"
                            >
                              {step.slot === "old"
                                ? poolLabels.old
                                : poolLabels.new}
                            </span>
                            <span class="text-gray-600">
                              {formatDateTime(step.startAt)}
                              {#if step.endAt}
                                → {formatDateTime(step.endAt)}
                              {:else}
                                → Present
                              {/if}
                            </span>
                          </div>
                          <span class="font-medium tabular-nums text-gray-900">
                            {formatScore(step.score)}
                            <span class="font-normal text-gray-400">
                              · {formatRating(step.rating)}
                            </span>
                          </span>
                        </div>
                      {/each}
                    </div>
                  </details>
                {/if}
              </div>
            </div>
          </li>
        {/each}
      </ol>
    </div>
  </div>
{/if}
