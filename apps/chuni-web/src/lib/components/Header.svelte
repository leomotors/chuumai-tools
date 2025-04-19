<script lang="ts">
  import { Github, Twitter } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { env } from "$env/dynamic/public";
  import { webVersion } from "$lib/version.js";

  interface Props {
    children: Snippet;
    lastPlayed: Date;
  }

  let { children, lastPlayed }: Props = $props();
</script>

<header class="flex justify-between gap-4 pb-2">
  <!-- Left -->
  {@render children()}

  <!-- Right -->
  <div class="flex gap-8">
    <div class="bg-white/60 rounded-lg p-4 self-end text-xl">
      <p class="font-bold">Music for Rating Image Generator</p>

      <p>
        Last Played: {new Date(lastPlayed).toLocaleString()}
      </p>

      <p>
        Generated at: {new Date().toLocaleString()}
      </p>

      <div class="flex gap-1 items-center font-normal">
        <Github />
        <p>leomotors/chuumai-tools</p>
      </div>

      <div class="flex gap-1 items-center font-normal">
        <Twitter />
        <p>@LeomotorsTH</p>
      </div>

      <p>Web Version: {webVersion} @ {env.PUBLIC_VERSION || "???"}</p>
    </div>

    <img src="/verse_logo.webp" alt="Verse Logo" class="h-[217px]" />
  </div>
</header>
