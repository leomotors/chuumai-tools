<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { Github, Twitter } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    lastPlayed: Date;
  }

  let { children, lastPlayed }: Props = $props();

  // @ts-expect-error defined global in Vite
  // eslint-disable-next-line no-undef
  const webVersion = WEB_VERSION as string;
</script>

<header class="flex justify-between gap-4 pb-2">
  <!-- Left -->
  {@render children()}

  <!-- Right -->
  <div class="flex gap-8">
    <div class="bg-white/60 rounded-lg p-4 self-end text-xl font-bold mb-4">
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
