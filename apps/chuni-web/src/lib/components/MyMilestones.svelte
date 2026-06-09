<script lang="ts">
  import {
    CalendarDays,
    CalendarRange,
    Check,
    Circle,
    Gamepad2,
    Hash,
    Timer,
  } from "@lucide/svelte";

  import Rating from "$lib/components/profile/Rating.svelte";
  import { formatChuniRating } from "$lib/utils/chuniRating";

  import {
    formatRatingMilestoneElapsed,
    type RatingMilestoneProgress,
  } from "@repo/core/web";
  import * as Tabs from "@repo/ui/atom/tabs";
  import { cn } from "@repo/ui/utils";

  type Props = {
    milestones?: RatingMilestoneProgress;
  };

  let { milestones }: Props = $props();

  const fallbackMilestones: RatingMilestoneProgress = {
    allTime: [],
    currentVersion: [],
    currentVersionStart: null,
  };

  let scope = $state("allTime");

  const safeMilestones = $derived(milestones ?? fallbackMilestones);

  const sourceRows = $derived(
    scope === "currentVersion"
      ? safeMilestones.currentVersion
      : safeMilestones.allTime,
  );

  const nextMilestone = $derived(
    sourceRows.find(
      (milestone) => !milestone.achievedAt && !milestone.isStartingPoint,
    ),
  );

  const rows = $derived([
    ...(nextMilestone ? [nextMilestone] : []),
    ...sourceRows
      .filter((milestone) => milestone.achievedAt)
      .sort((a, b) => b.rating - a.rating),
  ]);

  const achievedCount = $derived(
    sourceRows.filter(
      (milestone) => milestone.achievedAt && !milestone.isStartingPoint,
    ).length,
  );

  const milestoneCount = $derived(
    sourceRows.filter((milestone) => !milestone.isStartingPoint).length,
  );

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function formatDate(date: Date): string {
    return dateFormatter.format(new Date(date));
  }

  function formatPlayCount(value: number): string {
    if (value === 0) return "same play";
    return `${value.toLocaleString()} play${value === 1 ? "" : "s"}`;
  }

  function formatElapsedRow(
    elapsed: string | null,
    suffix: "from previous" | "since previous",
  ): string {
    return elapsed ? `${elapsed} ${suffix}` : "No previous milestone";
  }

  function formatPlayCountRow(
    playCount: number | null,
    hasPreviousMilestone: boolean,
    suffix: "from previous" | "since previous",
  ): string {
    if (playCount !== null) return `${formatPlayCount(playCount)} ${suffix}`;
    return hasPreviousMilestone
      ? "Play count unavailable"
      : "No previous milestone";
  }
</script>

<section
  class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
>
  <Tabs.Root bind:value={scope} class="gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-[15px] font-semibold tracking-tight text-gray-900">
          My Milestones
        </h3>
        <p class="mt-0.5 text-[11.5px] text-gray-400">
          {achievedCount}/{milestoneCount} reached{#if scope === "currentVersion" && safeMilestones.currentVersionStart}
            since {formatDate(safeMilestones.currentVersionStart)}
          {/if}
        </p>
      </div>

      <Tabs.List class="h-10 bg-gray-100 p-1 text-gray-500">
        <Tabs.Trigger
          value="allTime"
          class="min-w-32 px-6 data-[state=active]:bg-white data-[state=active]:text-gray-900"
        >
          All Time
        </Tabs.Trigger>
        <Tabs.Trigger
          value="currentVersion"
          class="min-w-48 gap-2 px-6 data-[state=active]:bg-white data-[state=active]:text-gray-900"
        >
          <CalendarRange class="size-3.5" />
          Current Version
        </Tabs.Trigger>
      </Tabs.List>
    </div>

    {#if rows.length > 0}
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {#each rows as milestone (milestone.id)}
          {@const isNext = milestone.id === nextMilestone?.id}
          {@const elapsedFromPrevious = formatRatingMilestoneElapsed(
            milestone.previousAchievedAt,
            milestone.achievedAt,
          )}
          {@const elapsedSincePrevious =
            isNext && !milestone.achievedAt
              ? formatRatingMilestoneElapsed(
                  milestone.previousAchievedAt,
                  new Date(),
                )
              : null}
          <div
            class={cn(
              "flex min-h-24 flex-col justify-between rounded-lg border px-3 py-3 transition-colors",
              isNext
                ? "border-blue-200 bg-blue-50/70"
                : milestone.achievedAt
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50/70",
            )}
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <Rating rating={milestone.rating} showCalculated={false} />
                <div class="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                  <p class="truncate text-xs font-semibold text-gray-700">
                    {milestone.label}
                  </p>
                  {#if isNext}
                    <span
                      class="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700"
                    >
                      Next
                    </span>
                  {:else if milestone.isStartingPoint}
                    <span
                      class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                    >
                      Start
                    </span>
                  {/if}
                </div>
              </div>
              <div
                class={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full",
                  isNext
                    ? "bg-blue-100 text-blue-700"
                    : milestone.achievedAt
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-400",
                )}
              >
                {#if milestone.achievedAt}
                  <Check class="size-2.5" />
                {:else}
                  <Circle class="size-2.5" />
                {/if}
              </div>
            </div>

            <div class="mt-3 space-y-1 text-[11px] text-gray-500">
              {#if milestone.achievedAt}
                <p class="flex items-center gap-1.5">
                  <CalendarDays class="size-3.5" />
                  <span>{formatDate(milestone.achievedAt)}</span>
                </p>
                <p class="flex items-center gap-1.5">
                  <Hash class="size-3.5" />
                  <span>
                    {milestone.jobId
                      ? `Job #${milestone.jobId}`
                      : "Manual entry"}
                    {#if milestone.achievedRating !== null}
                      · {formatChuniRating(milestone.achievedRating)}
                    {/if}
                  </span>
                </p>
                <p class="flex items-center gap-1.5">
                  <Timer class="size-3.5" />
                  <span>
                    {formatElapsedRow(elapsedFromPrevious, "from previous")}
                  </span>
                </p>
                <p class="flex items-center gap-1.5">
                  <Gamepad2 class="size-3.5" />
                  <span>
                    {formatPlayCountRow(
                      milestone.playCountFromPrevious,
                      milestone.previousAchievedAt !== null,
                      "from previous",
                    )}
                  </span>
                </p>
              {:else}
                <p>Next target</p>
                <p class="flex items-center gap-1.5">
                  <Timer class="size-3.5" />
                  <span>
                    {formatElapsedRow(elapsedSincePrevious, "since previous")}
                  </span>
                </p>
                <p class="flex items-center gap-1.5">
                  <Gamepad2 class="size-3.5" />
                  <span>
                    {formatPlayCountRow(
                      milestone.playCountSincePrevious,
                      milestone.previousAchievedAt !== null,
                      "since previous",
                    )}
                  </span>
                </p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-8 text-center"
      >
        <p class="text-xs text-gray-500">No milestone data available.</p>
      </div>
    {/if}
  </Tabs.Root>
</section>
