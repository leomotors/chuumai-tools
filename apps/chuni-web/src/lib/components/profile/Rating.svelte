<script lang="ts">
  import { extractDigits } from "@repo/core";
  import { getChuniRatingLevel } from "@repo/core/chuni";
  import { cn } from "@repo/ui/utils";

  interface Props {
    rating: number;
    calculatedRating?: number;
    showCalculated?: boolean;
    class?: string;
    digitClass?: string;
    commaClass?: string;
  }

  let {
    rating,
    calculatedRating = rating,
    showCalculated = true,
    class: className,
    digitClass = "self-end",
    commaClass = "self-end",
  }: Props = $props();

  let ratingLevel = $derived(getChuniRatingLevel(rating));

  let {
    tens: tensOri,
    ones: onesOri,
    tenths: tenthsOri,
    hundredths: hundredthsOri,
  } = $derived(extractDigits(rating));

  let { tens, ones, tenths, hundredths, thousandths, tenthousandths } =
    $derived(extractDigits(calculatedRating));

  let ratingMatched = $derived(
    tens === tensOri &&
      ones === onesOri &&
      tenths === tenthsOri &&
      hundredths === hundredthsOri,
  );

  const label = $derived(`Rating ${rating.toFixed(2)}`);
</script>

<div
  class={cn("flex w-fit shrink-0 items-center gap-1", className)}
  role="img"
  aria-label={label}
>
  {#if tensOri}
    <img
      src="/rating/{ratingLevel}/{tensOri}.png"
      class={cn(digitClass, "shrink-0")}
      alt=""
    />
  {/if}
  <img
    src="/rating/{ratingLevel}/{onesOri}.png"
    class={cn(digitClass, "shrink-0")}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/comma.png"
    class={cn(commaClass, "shrink-0")}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/{tenthsOri}.png"
    class={cn(digitClass, "shrink-0")}
    alt=""
  />
  <img
    src="/rating/{ratingLevel}/{hundredthsOri}.png"
    class={cn(digitClass, "shrink-0")}
    alt=""
  />
  {#if showCalculated}
    {#if ratingMatched}
      <img
        src="/rating/{ratingLevel}/{thousandths}.png"
        class={cn(digitClass, "h-[19px] shrink-0")}
        alt=""
      />
      <img
        src="/rating/{ratingLevel}/{tenthousandths}.png"
        class={cn(digitClass, "h-[19px] shrink-0")}
        alt=""
      />
    {:else}
      <span class="font-helvetica ml-0.5 translate-y-1.5 text-xl font-bold">
        ({calculatedRating.toFixed(4)})
      </span>
    {/if}
  {/if}
</div>
