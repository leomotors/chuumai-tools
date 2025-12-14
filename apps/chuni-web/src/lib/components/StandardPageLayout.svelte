<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    alignItems = "center",
  }: { children: Snippet; alignItems?: "start" | "center" } = $props();

  const alignClass = $derived(
    alignItems === "start" ? "items-start" : "items-center",
  );
</script>

<main
  class="flex flex-col {alignClass} w-full px-4 pb-16 pt-32 gap-6 font-app min-h-screen bg-gray-50"
>
  {@render children()}
</main>
