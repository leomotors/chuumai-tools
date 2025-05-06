<script lang="ts">
  import { extractDigits } from "@repo/utils-chuni";

  interface Props {
    rating: number;
    calculatedRating: number;
  }

  let { rating, calculatedRating }: Props = $props();

  let ratingLevel =
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
                      : "green";

  let { tens, ones, tenths, hundredths, thousandths, tenthousandths } =
    $derived(extractDigits(calculatedRating));

  let ratingMatched = $derived(
    rating <= calculatedRating && calculatedRating < rating + 0.01,
  );
</script>

{#if tens}
  <img
    src="/rating/{ratingLevel}/{tens}.png"
    class="self-end"
    alt="Rating Tens"
  />
{/if}
<img
  src="/rating/{ratingLevel}/{ones}.png"
  class="self-end"
  alt="Rating Ones"
/>
<img
  src="/rating/{ratingLevel}/comma.png"
  alt="Rating Comma"
  class="self-end"
/>
<img
  src="/rating/{ratingLevel}/{tenths}.png"
  class="self-end"
  alt="Rating Tenth"
/>
<img
  src="/rating/{ratingLevel}/{hundredths}.png"
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
