<script lang="ts">
  import { Github, Globe, Twitter, Workflow } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { getLogoMapping } from "$lib/constants/index";

  interface Props {
    children: Snippet;
    lastPlayed: Date;
    version: string;
  }

  let { children, lastPlayed, version }: Props = $props();

  const logo = $derived(getLogoMapping(version));
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
          <Twitter />
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
        <Github />
        <p>leomotors/chuumai-tools</p>
      </div>

      <div class="flex gap-1 items-center font-normal text-slate-800">
        <Workflow />
        <p>Web Version: {WEB_VERSION}</p>
      </div>

      <div class="flex gap-1 items-center font-normal text-slate-800">
        <Globe />
        <p>https://chuni.wonderhoy.me</p>
      </div>
    </div>

    <img src={logo} alt="Version {version} Logo" class="h-[217px] scale-125" />
  </div>
</header>
