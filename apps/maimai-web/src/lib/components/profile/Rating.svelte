<script lang="ts">
  interface Props {
    rating: number;
    calculatedRating: number;
  }

  let { rating, calculatedRating }: Props = $props();

  let ratingLevel = $derived(
    rating >= 15000
      ? "rainbow"
      : rating >= 14500
        ? "platinum"
        : rating >= 14000
          ? "gold"
          : rating >= 13000
            ? "silver"
            : rating >= 12000
              ? "bronze"
              : rating >= 10000
                ? "purple"
                : rating >= 7000
                  ? "red"
                  : rating >= 4000
                    ? "orange"
                    : rating >= 2000
                      ? "green"
                      : rating >= 1000
                        ? "blue"
                        : "normal",
  );

  let ratingMatched = $derived(rating === calculatedRating);

  let splitted = $derived(String(rating).split(""));
</script>

<div
  class="w-[296px] h-[86px] bg-contain bg-no-repeat bg-center flex items-center justify-end"
  style="background-image: url(/rating/{ratingLevel}.png)"
>
  <p
    class="flex items-center justify-end gap-[14px] pr-6 text-2xl text-amber-300 font-rodin-b"
  >
    {#each splitted as digit, index (index)}
      <span>{digit}</span>
    {/each}
  </p>
</div>
