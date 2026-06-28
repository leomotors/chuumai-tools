<script lang="ts" module>
  export type ReleaseDateSortMode = "jp" | "intl";
</script>

<script lang="ts">
  import { ArrowDown, ArrowUp } from "@lucide/svelte";

  type Props = {
    isSorting: boolean;
    sortDirection: "asc" | "desc";
    mode: ReleaseDateSortMode;
    onModeChange: (mode: ReleaseDateSortMode) => void;
  };

  let { isSorting, sortDirection, mode, onModeChange }: Props = $props();

  function handleModeClick(next: ReleaseDateSortMode, event: MouseEvent) {
    event.stopPropagation();
    onModeChange(next);
  }
</script>

<div class="flex items-center gap-1.5">
  <span class="inline-flex items-center gap-2">
    Release
    {#if isSorting}
      {#if sortDirection === "asc"}
        <ArrowUp class="size-4" />
      {:else}
        <ArrowDown class="size-4" />
      {/if}
    {/if}
  </span>
  <span
    class="inline-flex shrink-0 rounded bg-black/[0.06] p-px"
    role="group"
    aria-label="Release date region"
  >
    <button
      type="button"
      onclick={(event) => handleModeClick("jp", event)}
      class="rounded px-1 py-px text-[9px] font-semibold leading-none transition-colors"
      class:bg-white={mode === "jp"}
      class:text-gray-900={mode === "jp"}
      class:shadow-sm={mode === "jp"}
      class:text-gray-400={mode !== "jp"}
      class:hover:text-gray-700={mode !== "jp"}
      aria-pressed={mode === "jp"}
    >
      JP
    </button>
    <button
      type="button"
      onclick={(event) => handleModeClick("intl", event)}
      class="rounded px-1 py-px text-[9px] font-semibold leading-none transition-colors"
      class:bg-white={mode === "intl"}
      class:text-gray-900={mode === "intl"}
      class:shadow-sm={mode === "intl"}
      class:text-gray-400={mode !== "intl"}
      class:hover:text-gray-700={mode !== "intl"}
      aria-pressed={mode === "intl"}
    >
      Intl
    </button>
  </span>
</div>
