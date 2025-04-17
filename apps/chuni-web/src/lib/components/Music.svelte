<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import type { BaseChartSchema } from "@repo/types-chuni";
  import { calculateRating, getRank } from "@repo/utils-chuni";

  interface Props {
    music: BaseChartSchema & {
      constant: number;
      constantSure: boolean;
      jacketImg: string;
    };
    index: number;
  }

  let { music, index }: Props = $props();
</script>

<div
  class={twMerge(
    "rounded-lg w-[220px] h-[200px] flex flex-col gap-2 relative",
    music.difficulty === "basic" && "bg-green-400/80",
    music.difficulty === "advanced" && "bg-yellow-400/80",
    music.difficulty === "expert" && "bg-red-400/80",
    music.difficulty === "master" && "bg-purple-400/80",
    music.difficulty === "ultima" && "bg-black/80 text-white",
  )}
>
  <div
    class="absolute rounded-full -top-[10px] -left-[10px] p-1 w-8 h-8 bg-white flex justify-center items-center text-black"
  >
    <p class="text-2xl font-bold">{index + 1}</p>
  </div>

  <!-- Upper -->
  <div class="flex justify-between px-2 pt-2">
    <!-- Left -->
    <div>
      <p class="font-bold pl-6 text-xl font-helvetica">
        {music.difficulty.toUpperCase()}
      </p>
      <p
        class={twMerge(
          "text-xl -mt-1 whitespace-nowrap w-[150px] overflow-ellipsis overflow-hidden",
          music.title.length > 15 && "text-lg",
        )}
      >
        {music.title}
      </p>
    </div>

    <!-- Right -->
    <p
      class="p-1 font-helvetica bg-white rounded h-[36px] w-[50px] text-black flex justify-end items-baseline gap-1"
    >
      <span class="font-bold text-2xl text-[26px]">
        {Math.floor(music.constant)}
      </span>
      <span class="-ml-1">
        .{music.constantSure
          ? Math.floor(((music.constant % 1) + Number.EPSILON * 100) * 10)
          : "?"}
      </span>
    </p>
  </div>

  <!-- Mid -->
  <div class="px-2 flex gap-2">
    <img
      src="https://s3.lmhome.dev/chunithm/musicImages/{music.jacketImg}"
      alt="Jacket"
      class="w-[100px] h-[100px]"
    />

    <div class="flex flex-col justify-evenly font-helvetica">
      <div class="flex flex-col">
        <p class="text-sm">SCORE</p>
        <p class="text-xl">{music.score.toLocaleString()}</p>
      </div>

      <div class="flex flex-col">
        <p class="text-sm">PLAY RATING</p>
        <p class="font-bold text-2xl">
          {calculateRating(music.score, music.constant).toFixed(2)}
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
