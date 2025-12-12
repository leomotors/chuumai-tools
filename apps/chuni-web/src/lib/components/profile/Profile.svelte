<script lang="ts">
  import { anotherRarity } from "@repo/core/chuni";
  import type { ImgGenInput } from "@repo/types/chuni";

  import Rating from "./Rating.svelte";

  interface Props {
    profile: ImgGenInput["profile"];
    calculatedRating: number;
  }

  let { profile, calculatedRating }: Props = $props();
</script>

<div class="bg-white/60 rounded-xl p-2 flex gap-2">
  <!-- Left -->
  <div
    class="bg-contain bg-no-repeat bg-center w-[200px] h-[200px] relative"
    style="background-image: url(/charaframe/{anotherRarity(
      profile.characterRarity.toLowerCase(),
    )}.png)"
  >
    <img
      src={profile.characterImage}
      alt="Character"
      class="w-[90%] h-[90%] top-[5%] left-[5%] absolute"
    />
  </div>

  <!-- Right -->
  <div class="-mt-2">
    <div
      class="w-[400px] h-14 bg-contain bg-no-repeat bg-center flex items-center justify-center"
      style="background-image: url(/team_bg/{profile.teamEmblem?.toLowerCase() ??
        'normal'}.png)"
    >
      <p class="text-2xl text-center text-white">
        {profile.teamName || "-"}
      </p>
    </div>

    <div
      class="w-[400px] h-[42px] bg-contain bg-no-repeat bg-center flex items-center justify-center"
      style="background-image: url(/honor_bg/{anotherRarity(
        profile.honorRarity.toLowerCase(),
      )}.png)"
    >
      <!-- z-10 is specially for Phosphoribosylaminoimidazolesuccinocarboxamide (メズマライザー ULTIMA SSS)-->
      <p class="text-2xl font-bold text-center z-10">{profile.honorText}</p>
    </div>

    <div class="flex gap-2 items-center justify-between text-2xl px-4">
      <p>Lv.{profile.playerLevel}</p>
      <p class="font-bold">{profile.playerName}</p>
      {#if profile.classEmblem}
        <div class="relative w-[94px] h-[46px]">
          {#if profile.classBand}
            <img
              src="/classemblem/band_0{profile.classBand}.png"
              alt="Class Band"
              class="absolute top-0 left-0 w-full h-full"
            />
          {/if}
          <img
            src="/classemblem/medal_0{profile.classEmblem}.png"
            alt="Class Emblem"
            class="absolute top-0 left-0 w-full h-full"
          />
        </div>
      {:else}
        <div class="w-[94px] h-[46px]"></div>
      {/if}
    </div>

    <div class="flex gap-2 items-baseline px-4">
      <p class="text-2xl font-bold">RATING</p>

      <div class="items-center flex gap-1 ml-4">
        <Rating rating={profile.rating} {calculatedRating} />
      </div>
    </div>

    <div class="flex gap-2 items-baseline px-4">
      <p class="text-2xl font-bold">OVERPOWER</p>
      <p class="text-2xl">
        {profile.overpowerValue.toFixed(2)}
        ({profile.overpowerPercent.toFixed(2)}%)
      </p>
    </div>
  </div>
</div>
