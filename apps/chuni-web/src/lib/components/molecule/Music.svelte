<script lang="ts">
  import { Lock } from "@lucide/svelte";
  import { twMerge } from "tailwind-merge";

  import type { ChartForRender } from "$lib/types";

  import { getRank } from "@repo/utils/chuni";

  interface Props {
    music: ChartForRender;
    index: number;
  }

  let { music, index }: Props = $props();
</script>

<div
  class={twMerge(
    "rounded-lg w-[220px] h-[200px] flex flex-col gap-2 relative",
    music.difficulty === "basic" && "bg-green-400/60",
    music.difficulty === "advanced" && "bg-orange-400/60",
    music.difficulty === "expert" && "bg-red-400/60",
    music.difficulty === "master" && "bg-purple-400/60",
    music.difficulty === "ultima" &&
      "bg-gray-900/60 text-white outline-solid outline-[#ff3a3a]",
  )}
>
  <!-- Order -->
  <div
    class={twMerge(
      "absolute rounded-full -top-[10px] -left-[10px] p-1 w-8 h-8 flex justify-center items-center",
      music.isHidden ? "bg-red-500 text-white" : "bg-white text-black",
    )}
  >
    {#if music.isHidden}
      <Lock class="w-[20px] h-[20px]" />
    {:else}
      <p class="text-xl font-bold">{index + 1}</p>
    {/if}
  </div>

  <!-- Upper -->
  <div
    class={twMerge(
      "flex justify-between px-2 pt-2 rounded-t-lg",
      music.difficulty === "basic" && "bg-[#1eb393]",
      music.difficulty === "advanced" && "bg-[#ff7e00]",
      music.difficulty === "expert" && "bg-[#e35454]",
      music.difficulty === "master" && "bg-[#bf6aff]",
      music.difficulty === "ultima" && "bg-[#232323] text-white",
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
      class="p-1 font-helvetica bg-white rounded h-[36px] w-[50px] text-black flex justify-end items-baseline gap-1 relative"
    >
      <span class="font-bold text-2xl text-[26px]">
        {music.constant < 1 ? "?" : Math.floor(music.constant)}
      </span>
      <span class="-ml-1">
        .{music.constantSure
          ? Math.floor(((music.constant % 1) + Number.EPSILON * 100) * 10)
          : "?"}
      </span>

      {#if music.constant % 1 >= 0.5}
        <span
          class="absolute -top-[0.375rem] right-[0.375rem] font-bold text-xl"
        >
          +
        </span>
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
            --.--
          {:else}
            {music.rating.toFixed(2)}{#if !music.constantSure}?{/if}
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Lower -->
  <div class="flex justify-between px-2">
    {#if music.clearMark}
      <img
        src="/clearmark/{music.clearMark.toLowerCase()}.png"
        alt="Clear Mark"
      />
    {:else}
      <div class="w-[64px] h-[18px] border-2 border-gray-300 bg-gray-200"></div>
    {/if}

    <img src="/rankmark/{getRank(music.score)}.png" alt="Rank Mark" />

    {#if music.score === 1010000}
      <img src="/lampmark/ajc.png" alt="AJC Mark" />
    {:else if music.aj}
      <img src="/lampmark/aj.png" alt="AJ Mark" />
    {:else if music.fc}
      <img src="/lampmark/fc.png" alt="FC Mark" />
    {:else}
      <div class="w-[64px] h-[18px] border-2 border-gray-300 bg-gray-200"></div>
    {/if}
  </div>
</div>
