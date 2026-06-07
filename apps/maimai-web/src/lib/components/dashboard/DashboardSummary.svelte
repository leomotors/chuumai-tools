<script lang="ts">
  import {
    deltaSinceDays,
    lastPlayLabel,
    playsDeltaWeek,
    sparklineValues,
    transformUserStats,
  } from "$lib/components/dashboard/stats";
  import { MAIMAI_METRIC_CONFIG } from "$lib/components/StatsChart.svelte";
  import type { UserStats } from "$lib/functions/userStats";

  import { KpiTile } from "@repo/ui/molecule/KpiTile";
  import { UserProfileCard } from "@repo/ui/molecule/UserProfileCard";

  type Props = {
    user: {
      id: string | null;
      name?: string | null;
      image?: string | null;
    };
    jobCount?: number;
    userStats: UserStats[];
  };

  let { user, jobCount, userStats }: Props = $props();

  const records = $derived(transformUserStats(userStats));
  const latest = $derived(
    records.length > 0 ? records[records.length - 1] : undefined,
  );
</script>

<section class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_3fr]">
  <UserProfileCard
    {user}
    meta={[
      { label: `${jobCount ?? 0} jobs`, dotColor: "#10b981" },
      ...(lastPlayLabel(records)
        ? [{ label: `last play ${lastPlayLabel(records)}` }]
        : []),
    ]}
  />

  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#if latest}
      {@const rd = deltaSinceDays(records, 30, (record) => record.rating)}
      <KpiTile
        label="Rating"
        value={latest.rating.toLocaleString()}
        delta={rd?.text}
        deltaPositive={rd?.positive ?? true}
        color={MAIMAI_METRIC_CONFIG.rating.color}
        primary
        sparklineValues={sparklineValues(records, "rating")}
      />
      {@const pd = playsDeltaWeek(records)}
      <KpiTile
        label="Play Count"
        value={latest.playCount.toLocaleString()}
        delta={pd?.text}
        deltaSuffix="this week"
        deltaPositive={pd?.positive ?? true}
        color={MAIMAI_METRIC_CONFIG.playCount.color}
        sparklineValues={sparklineValues(records, "playCount")}
      />
      {@const sd = deltaSinceDays(records, 30, (record) => record.star)}
      <KpiTile
        label="Star"
        value={latest.star.toLocaleString()}
        delta={sd?.text}
        deltaPositive={sd?.positive ?? true}
        color={MAIMAI_METRIC_CONFIG.star.color}
        sparklineValues={sparklineValues(records, "star")}
      />
    {/if}
  </div>
</section>
