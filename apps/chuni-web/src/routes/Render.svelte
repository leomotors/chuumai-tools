<script lang="ts">
  import { Github } from "@lucide/svelte";

  import Music from "$lib/components/Music.svelte";
  import Profile from "$lib/components/profile/Profile.svelte";
  import type { RawImageGen } from "$lib/types";

  interface Props {
    input: RawImageGen;
  }

  let { input }: Props = $props();
  let { profile, best, current, rating } = input;

  // @ts-expect-error defined global in Vite
  // eslint-disable-next-line no-undef
  const webVersion = WEB_VERSION as string;
</script>

<div
  class="w-[2560px] h-[1440px] bg-contain bg-no-repeat bg-center bg-[url(/verse_bg.webp)] flex-col gap-2 p-4 hidden"
  id="chart"
>
  <header class="flex justify-between gap-4 pb-2">
    <!-- Left -->
    <Profile {profile} calculatedRating={rating.totalAvg} />

    <!-- Right -->
    <div class="flex gap-8">
      <div class="bg-white/60 rounded-lg p-4 self-end text-xl font-bold mb-4">
        <p>
          Last Played: {new Date(profile.lastPlayed).toLocaleDateString("ja")}
        </p>

        <div class="flex gap-1 items-center">
          <Github />
          <p>leomotors/chuumai-tools</p>
        </div>

        <p>Web Version: {webVersion}</p>
      </div>

      <img src="/verse_logo.webp" alt="Verse Logo" class="h-[217px]" />
    </div>
  </header>

  <main
    class="flex justify-evenly gap-2 p-8 rounded-xl bg-gray-500/30 backdrop-opacity-5"
  >
    <aside class="flex flex-col gap-4">
      <p class="text-3xl font-bold font-helvetica">
        BEST ({rating.bestAvg.toFixed(4)})
      </p>
      <div class="grid grid-cols-6 gap-4">
        {#each best as chart, index (index)}
          <Music {index} music={chart} />
        {/each}

        <!-- Repeat for 30 - best.length times -->
        {#each Array(30 - best.length) as _, index (index)}
          <div class="w-[220px] h-[200px] bg-gray-200/30 rounded-lg"></div>
        {/each}
      </div>
    </aside>

    <aside class="flex flex-col gap-4">
      <p class="font-bold text-3xl">CURRENT ({rating.currentAvg.toFixed(4)})</p>
      <div class="grid grid-cols-4 gap-4">
        {#each current as chart, index (index)}
          <Music {index} music={chart} />
        {/each}

        <!-- Repeat for 20 - current.length times -->
        {#each Array(20 - current.length) as _, index (index)}
          <div class="w-[220px] h-[200px] bg-gray-200/30 rounded-lg"></div>
        {/each}
      </div>
    </aside>
  </main>
</div>
