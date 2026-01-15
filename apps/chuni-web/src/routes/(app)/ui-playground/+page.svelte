<script lang="ts">
  import Music from "$lib/components/molecule/Music.svelte";
  import Profile from "$lib/components/profile/Profile.svelte";
  import Rating from "$lib/components/profile/Rating.svelte";

  import { Button } from "@repo/ui/atom/button";
</script>

<Button>Shadcn Button</Button>
<h1 class="font-bold text-3xl">Rating Components</h1>

<div
  class="rating-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 my-4"
>
  <div>
    <p>Rating = 14.6800</p>
    <div>
      <Rating rating={14.68} calculatedRating={14.68} />
    </div>
  </div>

  <div>
    <p>Rating = 16.3999</p>

    <div>
      <Rating rating={16.39} calculatedRating={16.3999} />
    </div>
  </div>

  <div>
    <p>Calculation Error (Actual 16.55, Calculated: 16.5620)</p>

    <div>
      <Rating rating={16.55} calculatedRating={16.562} />
    </div>
  </div>

  <div>
    <p>Rating = 0</p>

    <div>
      <Rating rating={0} calculatedRating={0} />
    </div>
  </div>

  <div>
    <p>Rating = 9.9999</p>

    <div>
      <Rating rating={9.99} calculatedRating={9.9999} />
    </div>
  </div>

  <div>
    <p>Rating = 17.6942</p>

    <div>
      <Rating rating={17.69} calculatedRating={17.6942} />
    </div>
  </div>
</div>

<h1 class="font-bold text-3xl">Profile</h1>

<Profile
  profile={{
    characterImage: "/mafuyu-bnw.png",
    characterRarity: "RAINBOW",
    teamName: "Team Name",
    teamEmblem: "RAINBOW",
    honorText: "祈 -我ら神祖と共に歩む者なり-",
    honorRarity: "PLATINUM",
    playerLevel: 169,
    playerName: "MAFUYU",
    classBand: 1,
    classEmblem: 6,
    rating: 16.39,
    overpowerValue: 69420.44,
    overpowerPercent: 69.69,
    lastPlayed: new Date("2025-05-05T00:00:00Z"),
    playCount: 999,
  }}
  calculatedRating={16.3999}
/>
<p>I forgor to handle player reborn (Lv 100+) 💀</p>

<p>Purple Team</p>
<Profile
  profile={{
    characterImage: "/mafuyu-bnw.png",
    characterRarity: "HOLOGRAPHIC",
    teamName: "Team Name",
    teamEmblem: "PURPLE",
    honorText: "創 -汝ら新世界へ歩む者なり-",
    honorRarity: "PLATINUM",
    playerLevel: 6767,
    playerName: "MAFUYU",
    classBand: 6,
    classEmblem: 6,
    rating: 17.27,
    overpowerValue: 67697.27,
    overpowerPercent: 99.99,
    lastPlayed: new Date("2025-12-31T00:00:00Z"),
    playCount: 1333,
  }}
  calculatedRating={17.2767}
/>

<p>Yellow Team</p>
<Profile
  profile={{
    characterImage: "/mafuyu-bnw.png",
    characterRarity: "RAINBOW",
    teamName: "Team Name",
    teamEmblem: "YELLOW",
    honorText: "祈 -我ら神祖と共に歩む者なり-",
    honorRarity: "PLATINUM",
    playerLevel: 169,
    playerName: "MAFUYU",
    classBand: 1,
    classEmblem: 6,
    rating: 16.39,
    overpowerValue: 69420.44,
    overpowerPercent: 69.69,
    lastPlayed: new Date("2025-05-05T00:00:00Z"),
    playCount: 999,
  }}
  calculatedRating={16.3999}
/>

<p>No Team?</p>
<Profile
  profile={{
    characterImage: "/mafuyu-bnw.png",
    characterRarity: "BRONZE",
    // teamName: "Team Name",
    // teamEmblem: "RAINBOW",
    honorText: "祈 -我ら神祖と共に歩む者なり-",
    honorRarity: "GOLD",
    playerLevel: 169,
    playerName: "MAFUYU",
    classEmblem: 1,
    rating: 16.39,
    overpowerValue: 69420.44,
    overpowerPercent: 69.69,
    lastPlayed: new Date("2025-05-05T00:00:00Z"),
    playCount: 999,
  }}
  calculatedRating={16.3999}
/>

<div
  class="bg-blue-300 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
>
  <Music
    index={0}
    music={{
      id: 2817,
      title: "Unwelcome School",
      difficulty: "ultima",
      score: 1002300,
      clearMark: "HARD",
      fc: false,
      aj: false,
      isHidden: false,
      constant: 15.0,
      constantSure: true,
      rating: 16.23,
      image: "7c236c814e236d39.jpg",
    }}
  />

  <Music
    index={1}
    music={{
      id: 2652,
      title: "Forsaken Tale",
      difficulty: "master",
      score: 998690,
      clearMark: "CLEAR",
      fc: false,
      aj: false,
      isHidden: false,
      constant: 15.7,
      constantSure: true,
      rating: 16.64,
      image: "0e32fa085f54f59c.jpg",
    }}
  />
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .rating-grid > div {
    @apply flex flex-col items-center gap-1;
  }

  .rating-grid > div > div {
    @apply flex items-center gap-1;
  }
</style>
