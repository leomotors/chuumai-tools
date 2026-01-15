<script lang="ts">
  import Music from "$lib/components/molecule/Music.svelte";
  import Profile from "$lib/components/profile/Profile.svelte";
  import Rating from "$lib/components/profile/Rating.svelte";

  import { Button } from "@repo/ui/atom/button";
</script>

<h1 class="font-bold text-xl">Rating Components</h1>

<Button>Shadcn Button</Button>

<p>Rating = 14280</p>

<div class="items-center flex gap-1 ml-4">
  <Rating rating={14280} calculatedRating={14280} />
</div>

<p>Rating = 16399</p>

<div class="items-center flex gap-1 ml-4">
  <Rating rating={16399} calculatedRating={16399} />
</div>

<p>Calculation Error (Actual 16550, Calculated: 16562)</p>

<div class="items-center flex gap-1 ml-4">
  <Rating rating={16550} calculatedRating={16562} />
</div>

<p>Rating = 0</p>

<div class="items-center flex gap-1 ml-4">
  <Rating rating={0} calculatedRating={0} />
</div>

<p>Rating = 9999</p>

<div class="items-center flex gap-1 ml-4">
  <Rating rating={9999} calculatedRating={9999} />
</div>

<p>Rating = 13370</p>

<div class="items-center flex gap-1 ml-4">
  <Rating rating={13370} calculatedRating={13370} />
</div>

<h1 class="font-bold text-xl">Profile</h1>

<Profile
  profile={{
    characterImage: "/mafuyu-bnw.png",

    honorText: "シリウスの輝きのように",
    honorRarity: "GOLD",

    playerName: "Ｌｅｏψｒθφ",

    courseRank: 10,
    classRank: 0,

    rating: 14912,
    star: 237,

    playCountCurrent: 111,
    playCountTotal: 529,
    lastPlayed: "2026-01-13T10:23:00Z",
  }}
  calculatedRating={16.3999}
/>

<div
  class="bg-blue-300 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
>
  <Music
    index={0}
    music={{
      title: "宙天",
      chartType: "dx",
      difficulty: "expert",
      score: 1004917,
      dxScore: 1857,
      dxScoreMax: 1980,
      comboMark: "NONE",
      syncMark: "NONE",
      level: 13.5,
      levelSure: true,
      rating: 293,
      image: "92fed24b2755bbb4.png",
    }}
  />

  <Music
    index={1}
    music={{
      title: "デビルじゃないもん",
      chartType: "dx",
      difficulty: "master",
      score: 1007825,
      dxScore: 2111,
      dxScoreMax: 2316,
      comboMark: "FC+",
      syncMark: "FDX",
      level: 13.0,
      levelSure: true,
      rating: 292,
      image: "b5e731e7ed59b8dd.png",
    }}
  />

  <Music
    index={2}
    music={{
      title: "デビルじゃないもん",
      chartType: "dx",
      difficulty: "advanced",
      score: 1007825,
      dxScore: 2111,
      dxScoreMax: 2316,
      comboMark: "FC+",
      syncMark: "FDX",
      level: 13.0,
      levelSure: true,
      rating: 292,
      image: "b5e731e7ed59b8dd.png",
    }}
  />

  <Music
    index={3}
    music={{
      title: "プラネタリウム・レヴュー",
      chartType: "dx",
      difficulty: "remaster",
      score: 1005858,
      dxScore: 1553,
      dxScoreMax: 1722,
      comboMark: "NONE",
      syncMark: "SYNC",
      level: 13.7,
      levelSure: true,
      rating: 308,
      image: "fa634284c1049256.png",
    }}
  />

  <Music
    index={4}
    music={{
      title:
        "False Amber (from the Black Bazaar, Or by A Kervan Trader from the Lands Afar, Or Buried Beneath the Shifting Sands That Lead Everywhere but Nowhere)",
      chartType: "dx",
      difficulty: "master",
      score: 927447,
      dxScore: 2651,
      dxScoreMax: 3576,
      comboMark: "NONE",
      syncMark: "SYNC",
      level: 14.8,
      levelSure: true,
      rating: 208,
      image: "5745f4aa35faeedd.png",
    }}
  />

  <Music
    index={5}
    music={{
      title: "化けの花",
      chartType: "dx",
      difficulty: "master",
      score: 1010000,
      dxScore: 100,
      dxScoreMax: 100,
      comboMark: "AP+",
      syncMark: "FDX+",
      level: 15.0,
      levelSure: true,
      rating: 337,
      image: "67c30af72f7293e4.png",
    }}
  />

  <Music
    index={6}
    music={{
      title: "化けの花",
      chartType: "dx",
      difficulty: "master",
      score: 1010000,
      dxScore: 100,
      dxScoreMax: 100,
      comboMark: "AP+",
      syncMark: "FDX+",
      level: 15.0,
      levelSure: false,
      rating: 337,
      image: "67c30af72f7293e4.png",
    }}
  />

  <Music
    index={6}
    music={{
      title: "化けの花",
      chartType: "dx",
      difficulty: "master",
      score: 1010000,
      dxScore: 100,
      dxScoreMax: 100,
      comboMark: "AP+",
      syncMark: "FDX+",
      level: 15.6,
      levelSure: false,
      rating: 351,
      image: "67c30af72f7293e4.png",
    }}
  />
</div>
