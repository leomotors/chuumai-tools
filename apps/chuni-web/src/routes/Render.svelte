<script lang="ts">
  import Music from "$lib/components/Music.svelte";
  import Profile from "$lib/components/profile/Profile.svelte";
  import type { RawImageGen } from "$lib/types";

  interface Props {
    input: RawImageGen;
  }

  let { input }: Props = $props();
  let { profile, best, current, rating } = input;
</script>

<div
  class="w-[2560px] h-[1440px] bg-contain bg-no-repeat bg-center bg-[url(/verse_bg.webp)] hidden flex-col gap-4 p-4"
  id="chart"
>
  <header class="flex justify-between gap-4">
    <Profile {profile} calculatedRating={rating.totalAvg} />

    <img src="/verse_logo.webp" alt="Verse Logo" class="h-[217px]" />
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
          {#if chart}
            <Music
              {index}
              music={{
                ...chart,
                jacketImg: chart.image,
                constant: chart.constant,
                constantSure: chart.constantSure,
              }}
            />
          {:else}
            <div class="w-[220px] h-[200px] bg-gray-200 rounded-lg"></div>
          {/if}
        {/each}
      </div>
    </aside>

    <aside class="flex flex-col gap-4">
      <p class="font-bold text-3xl">CURRENT ({rating.currentAvg.toFixed(4)})</p>
      <div class="grid grid-cols-4 gap-4">
        {#each current as chart, index (index)}
          {#if chart}
            <Music
              {index}
              music={{
                ...chart,
                jacketImg: chart.image,
                constant: chart.constant,
                constantSure: chart.constantSure,
              }}
            />
          {:else}
            <div class="w-[220px] h-[200px] bg-gray-200 rounded-lg"></div>
          {/if}
        {/each}
      </div>
    </aside>
  </main>
</div>
