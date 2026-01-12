<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import { difficultyColorMap } from "@repo/core/maimai";
  import type { ChartForRender } from "@repo/types/maimai";

  interface Props {
    music: ChartForRender;
    index: number;
  }

  let { music, index }: Props = $props();
</script>

<div
  class={twMerge(
    "rounded-lg w-55 h-50 flex flex-col gap-2 relative",
    music.difficulty === "basic" && "bg-green-400/60",
    music.difficulty === "advanced" && "bg-orange-400/60",
    music.difficulty === "expert" && "bg-red-400/60",
    music.difficulty === "master" && "bg-purple-400/60",
    music.difficulty === "remaster" &&
      "bg-gray-900/60 text-white outline-solid outline-[#ff3a3a]",
  )}
  data-testid="music-card-{music.title}-{music.chartType}"
>
  <!-- Order -->
  <div
    class={twMerge(
      "absolute rounded-full -top-2.5 -left-2.5 p-1 w-8 h-8 flex justify-center items-center bg-white text-black",
    )}
  >
    <p class="text-xl font-bold">{index + 1}</p>
  </div>

  <!-- Upper -->
  <div
    class={twMerge(
      "flex justify-between px-2 pt-2 rounded-t-lg",
      difficultyColorMap[music.difficulty],
    )}
  >
    <!-- Left -->
    <div>
      <p class="font-bold pl-6 text-xl font-helvetica">
        {music.difficulty.toUpperCase()}
      </p>
      <p
        class={twMerge(
          "text-xl -mt-1 whitespace-nowrap w-[150px] overflow-ellipsis overflow-hidden -translate-y-0.5",
          music.title.length > 15 && "text-lg",
        )}
      >
        {music.title}
      </p>
    </div>

    <!-- Right -->
    <p
      class="p-1 font-helvetica bg-white rounded h-9 w-[50px] text-black flex justify-end items-baseline gap-1 relative"
    >
      <span class="font-bold text-2xl text-[26px]">
        {music.level < 1 ? "?" : Math.floor(music.level)}
      </span>
      <span class="-ml-1">
        .{music.levelSure
          ? Math.floor(((music.level % 1) + Number.EPSILON * 100) * 10)
          : "?"}
      </span>

      {#if music.level % 1 >= 0.5}
        <span class="absolute -top-1.5 right-1.5 font-bold text-xl"> + </span>
      {/if}
    </p>
  </div>

  <!-- Mid -->
  <div class="px-2 flex gap-2">
    <img
      src={music.image
        ? `/api/imageProxy?img=${music.image}`
        : "/placeholder.svg"}
      alt="Jacket"
      class="w-[100px] h-[100px]"
    />

    <div class="flex flex-col justify-evenly font-helvetica">
      <div class="flex flex-col">
        <p class="text-sm">SCORE</p>
        <p class="text-xl">{music.score.toLocaleString()}</p>
      </div>

      <div class="flex flex-col">
        <p class="text-sm text-nowrap">PLAY RATING</p>
        <p class="font-bold text-2xl">
          {#if !music.rating}
            ---
          {:else}
            {music.rating}{#if !music.levelSure}?{/if}
          {/if}
        </p>
      </div>
    </div>
  </div>
</div>
