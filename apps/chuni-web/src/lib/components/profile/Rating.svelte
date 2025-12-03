<script lang="ts">
  import { extractDigits } from "@repo/utils";

  interface Props {
    rating: number;
    calculatedRating: number;
  }

  let { rating, calculatedRating }: Props = $props();

  let ratingLevel = $derived(
    rating >= 17
      ? "kiwami"
      : rating >= 16
        ? "rainbow"
        : rating >= 15.25
          ? "platinum"
          : rating >= 14.5
            ? "gold"
            : rating >= 13.25
              ? "silver"
              : rating >= 12
                ? "bronze"
                : rating >= 10
                  ? "purple"
                  : rating >= 7
                    ? "red"
                    : rating >= 4
                      ? "orange"
                      : "green",
  );

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
</script>

{#if tensOri}
  <img
    src="/rating/{ratingLevel}/{tensOri}.png"
    class="self-end"
    alt="Rating Tens"
  />
{/if}
<img
  src="/rating/{ratingLevel}/{onesOri}.png"
  class="self-end"
  alt="Rating Ones"
/>
<img
  src="/rating/{ratingLevel}/comma.png"
  alt="Rating Comma"
  class="self-end"
/>
<img
  src="/rating/{ratingLevel}/{tenthsOri}.png"
  class="self-end"
  alt="Rating Tenth"
/>
<img
  src="/rating/{ratingLevel}/{hundredthsOri}.png"
  class="self-end"
  alt="Rating Hundredth"
/>
{#if ratingMatched}
  <img
    src="/rating/{ratingLevel}/{thousandths}.png"
    class="self-end h-[19px]"
    alt="Rating Thousandth"
  />
  <img
    src="/rating/{ratingLevel}/{tenthousandths}.png"
    class="self-end h-[19px]"
    alt="Rating Tenthousandth"
  />
{:else}
  <span class="font-helvetica font-bold translate-y-1.5 text-xl ml-0.5">
    ({calculatedRating.toFixed(4)})
  </span>
{/if}
