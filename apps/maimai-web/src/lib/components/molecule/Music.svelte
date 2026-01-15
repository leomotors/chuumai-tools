<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import { difficultyColorMap, getDXStar, getRank } from "@repo/core/maimai";
  import { type ChartForRender, ranks } from "@repo/types/maimai";

  interface Props {
    index: number;
    music: ChartForRender;
  }

  let { index, music }: Props = $props();

  const comboMark = $derived(
    music.comboMark === "NONE"
      ? undefined
      : music.comboMark?.toLowerCase().replace("+", "p"),
  );
  const syncMark = $derived(
    music.syncMark === "NONE"
      ? undefined
      : music.syncMark?.toLowerCase().replace("+", "p"),
  );
  const rankMark = $derived(
    (ranks[getRank(music.score)] || "D").toLowerCase().replace("+", "p"),
  );
  const dxStar = $derived(getDXStar(music.dxScore ?? 0, music.dxScoreMax ?? 0));
</script>

<div
  class={twMerge(
    "rounded-lg w-65 h-50 flex flex-col relative",
    music.difficulty === "basic" && "bg-green-400/60",
    music.difficulty === "advanced" && "bg-orange-400/60",
    music.difficulty === "expert" && "bg-red-400/60",
    music.difficulty === "master" && "bg-purple-400/60",
    music.difficulty === "remaster" && "bg-purple-200/60",
  )}
  data-testid="music-card-{music.title}-{music.chartType}"
>
  <!-- Order -->
  <div
    class={twMerge(
      "absolute rounded-full -top-2.5 -left-2.5 p-1 w-8 h-8 flex justify-center items-center bg-white",
    )}
  >
    <p class="text-xl font-bold">{index + 1}</p>
  </div>

  <!-- Top -->
  <div
    class={twMerge(
      "px-2 pt-1.5 pb-0.5 rounded-t-lg",
      difficultyColorMap[music.difficulty],
    )}
  >
    <div class="flex items-center justify-between">
      <p class="font-bold pl-5 text-xl font-rodin-b -translate-y-0.5">
        {music.difficulty === "remaster"
          ? "Re:MASTER"
          : music.difficulty.toUpperCase()}
      </p>
    </div>
    <p
      class={twMerge(
        "text-xl -mt-1 whitespace-nowrap overflow-ellipsis overflow-hidden -translate-y-0.5",
        music.title.length > 15 && "text-lg",
      )}
    >
      {music.title}
    </p>
  </div>

  <!-- Overlay Level on Top Right -->
  <p
    class="absolute top-0 right-2 px-1 pt-0.5 font-rodin-b bg-white rounded h-9 w-[56px] text-black flex justify-end items-baseline gap-1 -translate-y-2 tracking-tighter"
  >
    <span class="font-bold text-2xl text-[26px]">
      {music.level < 1 ? "?" : Math.floor(music.level)}
    </span>
    <span class="-ml-1">
      .{music.levelSure
        ? Math.floor(((music.level % 1) + Number.EPSILON * 100) * 10)
        : "?"}
    </span>

    {#if (music.level % 1) + Number.EPSILON * 100 >= 0.6}
      <span class="absolute -top-2 right-2 font-bold text-xl"> + </span>
    {/if}
  </p>

  <!-- Bottom -->
  <div class="px-2 flex gap-2">
    <!-- Left -->
    <div class="mt-2 flex flex-col gap-1 shrink-0 items-center relative">
      <img
        src={music.image
          ? `/api/imageProxy?img=${music.image}`
          : "/placeholder.svg"}
        alt="Jacket"
        class="w-[125px] h-[125px]"
      />
      <img
        src="/charttype/{music.chartType}.png"
        alt="Chart Type"
        class="h-4 absolute -top-1.5 -left-1"
      />
    </div>

    <!-- Right -->
    <div class="flex flex-col flex-1 font-rodin-b">
      <div class="flex flex-col">
        <div class="flex items-end">
          <p class="text-sm">SCORE</p>
          <img
            src="/rankmark/{rankMark}.png"
            alt="Rank Mark"
            class="w-[70px] inline-block"
          />
        </div>
        <p class="text-lg">{(music.score / 10000).toFixed(4)}%</p>
      </div>

      <div class="flex flex-col">
        <p class="text-sm text-nowrap">PLAY RATING</p>
        <div class="flex justify-between items-center">
          <p class="font-bold text-xl">
            {#if !music.rating}
              ---
            {:else}
              {music.rating}{#if !music.levelSure}?{/if}
            {/if}
          </p>
          {#if dxStar}
            <img
              src="/dxstar/{dxStar}.png"
              alt="DX Star"
              class="w-7 h-7 mr-5 -translate-y-0.5"
            />
          {/if}
        </div>
      </div>

      <div class="w-full flex items-end justify-evenly">
        <img
          src="/playmark/{comboMark || 'fc_dummy'}.png"
          alt={comboMark || "NONE"}
          class="w-[54px] h-fit"
        />
        <img
          src="/playmark/{syncMark || 'sync_dummy'}.png"
          alt={syncMark || "NONE"}
          class="w-[54px] h-fit"
        />
      </div>
    </div>
  </div>
</div>
