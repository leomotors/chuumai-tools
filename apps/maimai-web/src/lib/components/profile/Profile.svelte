<script lang="ts">
  import type { ImgGenInput } from "@repo/types/maimai";

  interface Props {
    profile: ImgGenInput["profile"];
    calculatedRating?: number;
  }

  let { profile }: Props = $props();
</script>

<div class="bg-white/60 rounded-xl p-2 flex gap-2" data-testid="profile-header">
  <!-- Left -->
  <div class="w-[200px] h-[200px] relative">
    <img
      src={profile.characterImage}
      alt="Character"
      class="w-[90%] h-[90%] top-[5%] left-[5%] absolute"
    />
  </div>

  <!-- Right -->
  <div class="-mt-2">
    <div
      class="w-[400px] h-14 bg-gray-500 rounded-xl flex items-center justify-center"
    >
      <p class="text-2xl text-center text-white">No Circle</p>
    </div>

    <div
      class="w-[400px] h-[42px] bg-contain bg-no-repeat bg-center flex items-center justify-center"
    >
      <p class="text-2xl font-bold text-center z-10">{profile.honorText}</p>
    </div>

    <div class="flex gap-2 items-center justify-between text-2xl px-4">
      <p>Lv.{profile.star}</p>
      <p class="font-bold">{profile.playerName}</p>
      <div class="w-[94px] h-[46px]"></div>
    </div>

    <div class="flex gap-2 items-baseline px-4">
      <p class="text-2xl font-bold">RATING {profile.rating}</p>
    </div>
  </div>
</div>
