<script lang="ts">
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

  let tens = Math.floor(rating / 10);
  let ones = Math.floor(rating % 10);
  let tenth = Math.floor((rating % 1) * 10);
  let hundredth = Math.floor(((rating + Number.EPSILON * 10) % 0.1) * 100);

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
  src="/rating/{ratingLevel}/{tenth}.png"
  class="self-end"
  alt="Rating Tenth"
/>
<img
  src="/rating/{ratingLevel}/{hundredth}.png"
  class="self-end"
  alt="Rating Hundredth"
/>
{#if ratingMatched}
  <span
    class="font-helvetica font-bold translate-y-1.5 text-xl ml-0.5 tracking-widest"
  >
    {String(
      Math.floor(((calculatedRating % 0.01) + Number.EPSILON * 10000) * 10000),
    ).padStart(2, "0")}
  </span>
{:else}
  <span class="font-helvetica font-bold translate-y-1.5 text-xl ml-0.5">
    ({calculatedRating.toFixed(4)})
  </span>
{/if}
