<script lang="ts">
  import type { HTMLTdAttributes } from "svelte/elements";

  import { cn, type WithElementRef } from "@repo/ui/utils";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td
  bind:this={ref}
  data-slot="table-cell"
  class={cn(
    "whitespace-nowrap bg-clip-padding p-2 align-middle [&:has([role=checkbox])]:pe-0",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</td>
