<script lang="ts">
  import Music from "$lib/components/Music.svelte";
  import Profile from "$lib/components/profile/Profile.svelte";
  import type { Input } from "$lib/index.js";

  import type { ResponseData } from "./api/getConstant/+server";

  interface Props {
    input: Input;
  }

  let { input }: Props = $props();
  let { profile, best, new: newSongs } = input;

  let ids = [
    ...best.map((chart) => chart.id),
    ...newSongs.map((chart) => chart.id),
  ];

  let bestCharts = [
    ...best,
    ...(new Array(30 - best.length).fill(null) as Array<null>),
  ];
  let newCharts = [
    ...newSongs,
    ...(new Array(20 - newSongs.length).fill(null) as Array<null>),
  ];

  let data = $state<ResponseData | undefined>(undefined);

  async function getChartData(ids: number[]) {
    const response = await fetch(`/api/getConstant?ids=${ids.join(",")}`);
    const newData = (await response.json()) as ResponseData;

    data = newData;
  }

  $effect(() => {
    getChartData(ids);
  });
</script>

<div
  class="w-[2560px] h-[1440px] bg-contain bg-no-repeat bg-center bg-[url(/verse_bg.webp)] flex flex-col gap-4 p-4"
  id="chart"
>
  <header class="flex justify-between gap-4">
    <Profile {profile} />

    <img src="/verse_logo.webp" alt="Verse Logo" class="h-[217px]" />
  </header>

  <main
    class="flex justify-evenly gap-2 p-8 rounded-xl bg-gray-500/30 backdrop-opacity-5"
  >
    <aside class="flex flex-col gap-4">
      <p class="text-3xl font-bold font-helvetica">BEST</p>
      <div class="grid grid-cols-6 gap-4">
        {#each bestCharts as chart, index (index)}
          {#if chart}
            <Music
              {index}
              music={{
                ...chart,
                jacketImg:
                  data?.find((item) => item.id === chart.id)?.image ?? "",
                constant: +(
                  data
                    ?.find((item) => item.id === chart.id)
                    ?.constant.find((c) => c.difficulty === chart.difficulty)
                    ?.constant ?? 0
                ),
                constantSure:
                  data
                    ?.find((item) => item.id === chart.id)
                    ?.constant.find((c) => c.difficulty === chart.difficulty)
                    ?.constantSure ?? false,
              }}
            />
          {:else}
            <div class="w-[220px] h-[200px] bg-gray-200 rounded-lg"></div>
          {/if}
        {/each}
      </div>
    </aside>

    <aside class="flex flex-col gap-4">
      <p class="font-bold text-3xl">NEW</p>
      <div class="grid grid-cols-4 gap-4">
        {#each newCharts as chart, index (index)}
          {#if chart}
            <Music
              {index}
              music={{
                ...chart,
                jacketImg:
                  data?.find((item) => item.id === chart.id)?.image ?? "",
                constant: +(
                  data
                    ?.find((item) => item.id === chart.id)
                    ?.constant.find((c) => c.difficulty === chart.difficulty)
                    ?.constant ?? 0
                ),
                constantSure:
                  data
                    ?.find((item) => item.id === chart.id)
                    ?.constant.find((c) => c.difficulty === chart.difficulty)
                    ?.constantSure ?? false,
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
