<script lang="ts">
  import { History, LoaderCircle } from "@lucide/svelte";
  import { SvelteURLSearchParams } from "svelte/reactivity";

  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import RatingMusicCard from "$lib/components/dashboard/RatingMusicCard.svelte";

  import { Button } from "@repo/ui/atom/button";

  let { data } = $props();

  let loadingMore = $state(false);

  function formatDate(date: Date) {
    return new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadMoreHistory() {
    if (!data.nextLimit) return;

    loadingMore = true;

    try {
      const params = new SvelteURLSearchParams(window.location.search);
      params.set("limit", data.nextLimit.toString());
      await goto(resolve(`/dashboard/history?${params.toString()}`), {
        keepFocus: true,
        noScroll: true,
      });
    } finally {
      loadingMore = false;
    }
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
      Showing {data.history.length.toLocaleString()} most recent plays from play history.
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

    {#if data.hasMore && data.nextLimit}
      <div class="flex justify-center">
        <Button
          size="sm"
          variant="outline"
          class="min-w-32 gap-1.5"
          disabled={loadingMore}
          onclick={loadMoreHistory}
        >
          {#if loadingMore}
            <LoaderCircle class="size-3.5 animate-spin" />
          {/if}
          Load more
        </Button>
      </div>
    {/if}
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
