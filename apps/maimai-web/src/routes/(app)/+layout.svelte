<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<main
  class="flex flex-col items-center w-full px-4 pb-16 pt-32 gap-6 font-app min-h-screen bg-gray-50"
>
  {@render children()}
</main>
