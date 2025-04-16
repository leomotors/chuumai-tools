<script lang="ts">
  interface Props {
    rating: number;
  }

  let { rating }: Props = $props();

  let ratingLevel =
    rating >= 16
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
</script>

{#if tens}
  <img src="/rating/{ratingLevel}/{tens}.png" alt="Rating Tens" />
{/if}
<img src="/rating/{ratingLevel}/{ones}.png" alt="Rating Ones" />
<img
  src="/rating/{ratingLevel}/comma.png"
  alt="Rating Comma"
  class="self-end"
/>
<img src="/rating/{ratingLevel}/{tenth}.png" alt="Rating Tenth" />
<img src="/rating/{ratingLevel}/{hundredth}.png" alt="Rating Hundredth" />
