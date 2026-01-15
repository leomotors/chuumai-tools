<script lang="ts">
  import type { ImgGenInput } from "@repo/types/maimai";

  import Rating from "./Rating.svelte";

  interface Props {
    profile: ImgGenInput["profile"];
    calculatedRating: number;
  }

  let { profile, calculatedRating }: Props = $props();

  let isCourseAssetAvailable = $derived(
    [0, 6, 7, 10, 18, 19, 21, 22].includes(profile.courseRank ?? 0),
  );
  let isClassAssetAvailable = $derived(
    [0, 1, 2, 3, 4, 5, 7, 16, 18, 22].includes(profile.classRank ?? 0),
  );
</script>

<div class="bg-white/60 rounded-xl p-2 flex gap-2" data-testid="profile-header">
  <!-- Left -->
  <img
    src={profile.characterImage}
    alt="Character"
    class="w-[200px] h-[200px]"
  />

  <!-- Right -->
  <div class="flex flex-col gap-2 px-4">
    <!-- Honor / Trophy -->
    <div
      class="w-[400px] h-[38px] bg-contain bg-no-repeat bg-center flex items-center justify-center"
      style="background-image: url(/trophy/trophy_{profile.honorRarity.toLowerCase()}.png)"
    >
      <p class="text-2xl font-bold text-center z-10 whitespace-nowrap">
        {profile.honorText}
      </p>
    </div>

    <!-- Player Name / Rating -->
    <div class="flex gap-2 items-center justify-between text-2xl relative">
      <p class="font-bold font-rodin-b bg-white/50 p-2 rounded-2xl">
        {profile.playerName}
      </p>
      <div class="scale-[0.7] absolute -right-12">
        <Rating rating={profile.rating} {calculatedRating} />
      </div>
    </div>

    <!-- Course Badge & Star -->
    <div class="my-2 h-1 bg-white/50 rounded-full"></div>

    <div class="flex justify-evenly">
      {#if isCourseAssetAvailable}
        <img
          src="/course/{profile.courseRank || 0}.png"
          alt="Course Rank"
          class="h-[50px]"
        />
      {:else}
        <div class="h-[50px] w-[125px]"></div>
      {/if}

      {#if isClassAssetAvailable}
        <img
          src="/class/{profile.classRank || 0}.png"
          alt="Class Rank"
          class="h-[50px]"
        />
      {:else}
        <div class="h-[50px] w-[90px]"></div>
      {/if}

      <!-- Star -->
      <div class="flex items-center gap-2">
        <img src="/assets/icon_star.png" alt="Star Count" />
        <p class="text-2xl font-bold font-rodin-b">x {profile.star}</p>
      </div>
    </div>

    <!-- Team / Circle -->
  </div>
</div>
