<script lang="ts">
  import { extractDigits } from "@repo/core";
  import { getChuniRatingLevel } from "@repo/core/chuni";
  import { cn } from "@repo/ui/utils";

  type Props = {
    rating: number;
    class?: string;
    digitClass?: string;
    commaClass?: string;
  };

  let {
    rating,
    class: className,
    digitClass = "self-end",
    commaClass = "self-end",
  }: Props = $props();

  const ratingLevel = $derived(getChuniRatingLevel(rating));
  const digits = $derived(extractDigits(rating));
  const label = $derived(`Rating ${rating.toFixed(2)}`);
</script>

<div
  class={cn("flex w-fit shrink-0 items-center gap-1", className)}
  role="img"
  aria-label={label}
>
  {#if digits.tens}
    <img
      src="/rating/{ratingLevel}/{digits.tens}.png"
      class={cn(digitClass, "shrink-0")}
      alt=""
    />
  {/if}
  <img
    src="/rating/{ratingLevel}/{digits.ones}.png"
    class={cn(digitClass, "shrink-0")}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/comma.png"
    class={cn(commaClass, "shrink-0")}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/{digits.tenths}.png"
    class={cn(digitClass, "shrink-0")}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/{digits.hundredths}.png"
    class={cn(digitClass, "shrink-0")}
    alt=""
  />
</div>
