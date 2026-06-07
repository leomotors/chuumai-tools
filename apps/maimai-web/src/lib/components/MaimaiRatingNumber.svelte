<script lang="ts">
  import { getMaimaiRatingLevel } from "@repo/core/maimai";

  type Props = {
    rating: number;
  };

  let { rating }: Props = $props();

  const ratingLevel = $derived(getMaimaiRatingLevel(rating));
  const digits = $derived(String(rating).split(""));
</script>

<div
  class="flex h-[43px] w-[148px] items-center justify-end bg-contain bg-center bg-no-repeat"
  style="background-image: url(/rating/{ratingLevel}.png)"
>
  <p
    class="flex items-center justify-end gap-[5px] pr-[10px] font-rodin-b text-[15px] text-amber-300"
  >
    {#each digits as digit, index (index)}
      <span>{digit}</span>
    {/each}
  </p>
</div>
