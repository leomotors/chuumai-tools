<script lang="ts">
  import { ArrowDown, ArrowUp } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  type Props = {
    isSorting: boolean;
    sortDirection: "asc" | "desc";
    children: Snippet;
    align?: "left" | "center";
  };

  let { isSorting, sortDirection, children, align = "left" }: Props = $props();

  const alignClass = $derived(align === "center" ? "justify-center" : "");
</script>

<div class="flex items-center gap-2 {alignClass}">
  {@render children()}
  {#if isSorting}
    {#if sortDirection === "asc"}
      <ArrowUp class="size-4" />
    {:else}
      <ArrowDown class="size-4" />
    {/if}
  {/if}
</div>
