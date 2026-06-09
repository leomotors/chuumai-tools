<script lang="ts">
  import { History } from "@lucide/svelte";

  import RatingMusicCard from "$lib/components/dashboard/RatingMusicCard.svelte";

  let { data } = $props();

  function formatDate(date: Date) {
    return new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<section class="space-y-4">
  <div
    class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
  >
    <div class="flex items-center gap-2">
      <History class="size-5 text-gray-700" />
      <h1 class="text-lg font-semibold text-gray-950">History</h1>
    </div>
    <p class="mt-1 text-xs text-gray-500">
      Latest {data.history.length.toLocaleString()} plays from play history.
    </p>
  </div>

  {#if data.history.length > 0}
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {#each data.history as music, index (`${music.playedAt.toISOString()}-${music.trackNo}-${index}`)}
        <RatingMusicCard
          {music}
          meta="Track {music.trackNo} · {formatDate(music.playedAt)}"
        />
      {/each}
    </div>
  {:else}
    <div
      class="rounded-xl border border-gray-200/70 bg-white px-5 py-8 text-center shadow-sm"
    >
      <h2 class="text-sm font-semibold text-gray-900">No history yet</h2>
      <p class="mt-1 text-xs text-gray-500">
        Play history appears after a scrape job includes history records.
      </p>
    </div>
  {/if}
</section>
