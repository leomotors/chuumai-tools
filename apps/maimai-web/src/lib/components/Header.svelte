<script lang="ts">
  import { Globe, Workflow } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { page } from "$app/state";
  import { getLogoMapping, getLogoScale } from "$lib/constants/index";

  import GitHub from "@repo/ui/icons/GitHub.svelte";
  import X from "@repo/ui/icons/X.svelte";

  interface Props {
    children: Snippet;
    lastPlayed: Date;
    version: string;
  }

  let { children, lastPlayed, version }: Props = $props();

  const logo = $derived(getLogoMapping(version));
  const logoScale = $derived(getLogoScale(version));

  const scraperVersion = page.url.searchParams.get("scraperVersion");
</script>

<header class="flex justify-between gap-4 pb-2">
  <!-- Left -->
  {@render children()}

  <!-- Right -->
  <div class="flex gap-8">
    <div class="bg-white/60 rounded-lg p-4 self-end text-xl">
      <div class="font-bold flex gap-2">
        <p>Music for Rating Image Generator by</p>

        <div class="flex gap-1 items-center font-normal">
          <X class="size-6 shrink-0 text-black" />
          <p>@LeomotorsTH</p>
        </div>
      </div>

      <p>
        Last Played: {new Date(lastPlayed).toLocaleString()}
      </p>

      <p>
        Generated at: {new Date().toLocaleString()}
      </p>

      <div class="flex gap-1 items-center font-normal text-slate-800">
        <GitHub class="size-6 shrink-0 text-black" />
        <p>leomotors/chuumai-tools</p>
      </div>

      <div class="flex gap-1 items-center font-normal text-slate-800">
        <Workflow />
        <p>
          Web Version: {WEB_VERSION}
          {#if scraperVersion}
            | Scraper Version: {scraperVersion}
          {/if}
        </p>
      </div>

      <div class="flex gap-1 items-center font-normal text-slate-800">
        <Globe />
        <p>https://maimai.wonderhoy.me</p>
      </div>
    </div>

    <img
      src={logo}
      alt="Version {version} Logo"
      class="h-[217px] {logoScale}"
    />
  </div>
</header>
