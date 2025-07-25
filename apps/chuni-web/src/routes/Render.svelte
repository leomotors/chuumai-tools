<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Music from "$lib/components/molecule/Music.svelte";
  import Profile from "$lib/components/profile/Profile.svelte";
  import type { RawImageGen } from "$lib/types";

  interface Props {
    input: RawImageGen;
    version: string;
  }

  let { input, version }: Props = $props();
  let { profile, best, current, rating } = input;
</script>

<div
  class="w-[2560px] h-[1440px] bg-contain bg-no-repeat bg-center flex-col gap-2 p-4 hidden"
  id="chart"
  style="background-image: url({version === 'XVRS'
    ? '/xverse_bg.webp'
    : '/verse_bg.webp'})"
>
  <Header lastPlayed={new Date(profile.lastPlayed)} {version}>
    <Profile {profile} calculatedRating={rating.totalAvg} />
  </Header>

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

    <!-- Separator -->
    <div class="bg-gray-100/30 rounded-full w-[8px]"></div>

    <aside class="flex flex-col gap-4">
      <p class="font-bold text-3xl font-helvetica">
        CURRENT ({rating.currentAvg.toFixed(4)})
      </p>
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
