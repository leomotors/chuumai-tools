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
  class={cn("flex items-end gap-1", className)}
  role="img"
  aria-label={label}
>
  {#if digits.tens}
    <img
      src="/rating/{ratingLevel}/{digits.tens}.png"
      class={digitClass}
      alt=""
    />
  {/if}
  <img
    src="/rating/{ratingLevel}/{digits.ones}.png"
    class={digitClass}
    alt=""
  />
  <img src="/rating/{ratingLevel}/comma.png" class={commaClass} alt="" />
  <img
    src="/rating/{ratingLevel}/{digits.tenths}.png"
    class={digitClass}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/{digits.hundredths}.png"
    class={digitClass}
    alt=""
  />
</div>
