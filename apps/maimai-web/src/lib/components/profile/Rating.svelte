<script lang="ts">
  import { getMaimaiRatingLevel } from "@repo/core/maimai";
  import { cn } from "@repo/ui/utils";

  interface Props {
    rating: number;
    calculatedRating: number;
  }

  let { rating, calculatedRating }: Props = $props();

  let ratingLevel = $derived(getMaimaiRatingLevel(rating));

  let ratingMatched = $derived(rating === calculatedRating);

  let splitted = $derived(String(rating).split(""));
</script>

<div
  class="w-[296px] h-[86px] bg-contain bg-no-repeat bg-center flex items-center justify-end"
  style="background-image: url(/rating/{ratingLevel}.png)"
>
  <p
    class={cn(
      "flex items-center justify-end gap-[10px] pr-[21px] text-3xl font-rodin-b",
      ratingMatched ? "text-amber-300" : "text-gray-300",
    )}
  >
    {#each splitted as digit, index (index)}
      <span>{digit}</span>
    {/each}
  </p>
</div>
