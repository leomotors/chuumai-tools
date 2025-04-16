<script lang="ts">
  import type { Input } from "$lib";

  import { anotherRarity } from "@repo/utils-chuni";

  import Rating from "./Rating.svelte";

  interface Props {
    profile: Input["profile"];
  }

  let { profile }: Props = $props();
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
      class="w-[400px] h-[56px] bg-contain bg-no-repeat bg-center flex items-center justify-center"
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
        profile.honorLevel.toLowerCase(),
      )}.png)"
    >
      <p class="text-2xl font-bold text-center">{profile.honorText}</p>
    </div>

    <div class="flex gap-2 items-center justify-between text-2xl px-4">
      <p>Lv.{profile.playerLevel}</p>
      <p class="font-bold">{profile.playerName}</p>
      {#if profile.classEmblem}
        <img
          src="/classemblem/medal_0{profile.classEmblem}.png"
          alt="Class Emblem"
        />
      {:else}
        <div class="w-[94px] h-[46px]"></div>
      {/if}
    </div>

    <div class="flex gap-2 items-baseline px-4">
      <p class="text-2xl font-bold">RATING</p>

      <div class="items-center flex gap-1 ml-4">
        <Rating rating={profile.rating} />
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
