<script lang="ts" module>
  export type ProgressionRegressionPredictionItem = {
    id: string;
    summary: string;
  };

  export type ProgressionRegressionPredictionsProps = {
    nextPrediction: ProgressionRegressionPredictionItem;
    futurePredictions: ProgressionRegressionPredictionItem[];
  };
</script>

<script lang="ts">
  let {
    nextPrediction,
    futurePredictions,
  }: ProgressionRegressionPredictionsProps = $props();

  let showAll = $state(false);

  const hasMultiplePredictions = $derived(futurePredictions.length > 1);
</script>

<div class="mt-1 space-y-1.5">
  {#if showAll}
    <ul class="space-y-0.5 text-[11.5px] text-gray-500">
      {#each futurePredictions as prediction (prediction.id)}
        <li>{prediction.summary}</li>
      {/each}
    </ul>
  {:else}
    <p class="text-[11.5px] text-gray-500">{nextPrediction.summary}</p>
  {/if}

  {#if hasMultiplePredictions}
    <button
      type="button"
      onclick={() => (showAll = !showAll)}
      class="inline-flex cursor-pointer items-center gap-2 text-[11px] text-gray-400 select-none"
      aria-pressed={showAll}
      aria-label="Show all milestone predictions"
    >
      <span
        role="presentation"
        class="relative inline-flex h-4 w-7 shrink-0 rounded-full border transition-colors"
        class:border-gray-300={showAll}
        class:bg-gray-900={showAll}
        class:border-gray-200={!showAll}
        class:bg-gray-200={!showAll}
      >
        <span
          class="absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow-sm transition-transform"
          class:translate-x-3={showAll}
        ></span>
      </span>
      All milestones
    </button>
  {/if}
</div>
