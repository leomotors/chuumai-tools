<script lang="ts">
  import {
    deltaSinceDays,
    lastPlayLabel,
    playsDeltaWeek,
    sparklineValues,
    transformUserStats,
  } from "$lib/components/dashboard/stats";
  import { CHUNI_METRIC_CONFIG } from "$lib/components/StatsChart.svelte";
  import type { UserStats } from "$lib/functions/userStats";
  import { formatChuniRating } from "$lib/utils/chuniRating";

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

  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {#if latest}
      {@const rd = deltaSinceDays(records, 30, (record) => record.rating)}
      <KpiTile
        label="Rating"
        value={formatChuniRating(latest.rating)}
        delta={rd?.text}
        deltaPositive={rd?.positive ?? true}
        color={CHUNI_METRIC_CONFIG.rating.color}
        primary
        sparklineValues={sparklineValues(records, "rating")}
      />
      {@const od = deltaSinceDays(records, 30, (record) => record.overpower)}
      <KpiTile
        label="Overpower"
        value={parseFloat(latest.overpower.toFixed(2)).toLocaleString()}
        badgeLabel="OP%"
        badgeValue={`${latest.overpowerPercent.toFixed(2)}%`}
        delta={od?.text}
        deltaPositive={od?.positive ?? true}
        color={CHUNI_METRIC_CONFIG.overpower.color}
        sparklineValues={sparklineValues(records, "overpower")}
      />
      {@const pd = playsDeltaWeek(records)}
      <KpiTile
        label="Play Count"
        value={latest.playCount.toLocaleString()}
        delta={pd?.text}
        deltaSuffix="this week"
        deltaPositive={pd?.positive ?? true}
        color={CHUNI_METRIC_CONFIG.playCount.color}
        sparklineValues={sparklineValues(records, "playCount")}
      />
      {@const ld = deltaSinceDays(records, 30, (record) => record.playerLevel)}
      <KpiTile
        label="Player Level"
        value={latest.playerLevel.toLocaleString()}
        delta={ld?.text}
        deltaPositive={ld?.positive ?? true}
        color={CHUNI_METRIC_CONFIG.playerLevel.color}
        sparklineValues={sparklineValues(records, "playerLevel")}
      />
    {/if}
  </div>
</section>
