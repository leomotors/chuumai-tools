<script lang="ts" module>
  export type RatingMetricMode = "rating" | "maxRating";
</script>

<script lang="ts">
  type MetricStyle = { label: string; color: string };

  type Props = {
    selected: boolean;
    mode: RatingMetricMode;
    rating: MetricStyle;
    maxRating: MetricStyle;
    onModeChange: (mode: RatingMetricMode) => void;
  };

  let { selected, mode, rating, maxRating, onModeChange }: Props = $props();

  const activeColor = $derived(
    mode === "rating" ? rating.color : maxRating.color,
  );

  function handleChipClick() {
    onModeChange(mode);
  }
</script>

<span
  class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors"
  class:border-gray-300={selected}
  class:bg-gray-100={selected}
  class:text-gray-900={selected}
  class:border-gray-200={!selected}
  class:text-gray-500={!selected}
>
  <button
    type="button"
    onclick={handleChipClick}
    class="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 font-inherit text-inherit transition-colors"
    class:hover:text-gray-900={!selected}
    aria-pressed={selected}
  >
    <span
      class="size-[7px] shrink-0 rounded-full"
      style:background-color={activeColor}
      aria-hidden="true"
    ></span>
    Rating
  </button>
  <span
    class="inline-flex shrink-0 rounded bg-black/[0.06] p-px"
    role="group"
    aria-label="Rating mode"
  >
    <button
      type="button"
      onclick={() => onModeChange("maxRating")}
      class="rounded px-1 py-px text-[9px] font-semibold leading-none transition-colors"
      class:bg-white={mode === "maxRating"}
      class:text-gray-900={mode === "maxRating"}
      class:shadow-sm={mode === "maxRating"}
      class:text-gray-400={mode !== "maxRating"}
      class:hover:text-gray-700={mode !== "maxRating"}
      aria-pressed={mode === "maxRating"}
    >
      Max
    </button>
    <button
      type="button"
      onclick={() => onModeChange("rating")}
      class="rounded px-1 py-px text-[9px] font-semibold leading-none transition-colors"
      class:bg-white={mode === "rating"}
      class:text-gray-900={mode === "rating"}
      class:shadow-sm={mode === "rating"}
      class:text-gray-400={mode !== "rating"}
      class:hover:text-gray-700={mode !== "rating"}
      aria-pressed={mode === "rating"}
    >
      Now
    </button>
  </span>
</span>
