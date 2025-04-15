<script lang="ts">
  import Music from "$lib/components/Music.svelte";
  import Rating from "$lib/components/Rating.svelte";
  import type { Input } from "$lib/index.js";

  import type { ResponseData } from "./api/getConstant/+server";

  interface Props {
    input: Input;
  }

  let { input }: Props = $props();

  let ids = [
    ...input.best.map((chart) => chart.id),
    ...input.new.map((chart) => chart.id),
  ];

  let bestCharts = [
    ...input.best,
    ...(new Array(30 - input.best.length).fill(null) as Array<null>),
  ];
  let newCharts = [
    ...input.new,
    ...(new Array(20 - input.new.length).fill(null) as Array<null>),
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
    <div class="bg-white/60 rounded-xl p-2 flex gap-2">
      <div
        class="bg-contain bg-no-repeat bg-center w-[200px] h-[200px] relative"
        style="background-image: url(/charaframe/{input.characterFrame}.png)"
      >
        <img
          src="/api/profileImg?img={input.characterImage}"
          alt="Character"
          class="w-[90%] h-[90%] top-[5%] left-[5%] absolute"
        />
      </div>

      <div>
        <div
          class="w-[400px] h-[42px] bg-contain bg-no-repeat bg-center flex items-center justify-center"
          style="background-image: url(/honor_bg/{input.honorLevel}.png)"
        >
          <p class="text-2xl font-bold text-center">{input.honorText}</p>
        </div>

        <div class="flex gap-2 items-center text-2xl">
          <p>Lv. {input.playerLevel}</p>
          <p class="font-bold">{input.playerName}</p>
          {#if input.classEmblem}
            <img
              src="/classemblem/medal_0{input.classEmblem}.png"
              alt="Class Emblem"
            />
          {/if}
        </div>

        <div class="flex gap-2 items-baseline">
          <p class="text-2xl font-bold">RATING</p>

          <div class="items-center flex gap-1">
            <Rating rating={input.playerRating} />
          </div>
        </div>
      </div>
    </div>

    <img src="/verse_logo.webp" alt="Verse Logo" class="h-[217px]" />
  </header>

  <main
    class="flex justify-evenly gap-2 p-8 rounded-xl bg-gray-500/30 backdrop-opacity-5"
  >
    <aside class="flex flex-col gap-4">
      <p class="text-3xl font-bold">Best Songs</p>
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
      <p class="font-bold text-3xl">New Songs</p>
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
