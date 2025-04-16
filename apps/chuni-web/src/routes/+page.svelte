<script lang="ts">
  import { toPng } from "html-to-image";

  import Render from "./Render.svelte";

  const ut = {
    id: 2582,
    title: "Ultimate Force",
    difficulty: "master",
    score: 1010000,
    clearMark: "CATASTROPHY",
    fc: true,
    aj: true,
  } as const;

  async function handleDownload() {
    const element = document.getElementById("chart")!;

    const dataUrl = await toPng(element);
    // Download
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  }
</script>

<div>
  <h1 class="font-bold text-3xl">Chunithm Scraper</h1>

  <Render
    input={{
      profile: {
        characterImage:
          "https://chunithm-net-eng.com/mobile/img/a48871f78a3f1e9d.png",
        characterRarity: "RAINBOW",

        teamName: "Team Name",
        teamEmblem: "SILVER",

        honorText: "Ultimate Force",
        honorLevel: "PLATINUM",

        playerLevel: 69,
        playerName: "Ｌｅｏψｒθφ",
        classEmblem: 4,

        rating: 16.3,
        overpowerValue: 28475.22,
        overpowerPercent: 26.62,

        lastPlayed: new Date("2025-04-04T09:49:00Z"),
        playCount: 499,
      },
      best: [
        ut,
        {
          id: 2582,
          title: "Ultimate Force",
          difficulty: "expert",
          score: 1010000,
          clearMark: "CATASTROPHY",
          fc: true,
          aj: true,
        },
        {
          id: 2582,
          title: "Ultimate Force",
          difficulty: "advanced",
          score: 1010000,
          clearMark: "CATASTROPHY",
          fc: true,
          aj: true,
        },
        {
          id: 2582,
          title: "Ultimate Force",
          difficulty: "basic",
          score: 1010000,
          clearMark: "ABSOLUTE+",
          fc: true,
          aj: true,
        },
        {
          id: 1086,
          title: "祈 -我ら神祖と共に歩む者なり-",
          difficulty: "master",
          score: 1000482,
          clearMark: "ABSOLUTE",
          fc: true,
          aj: true,
        },
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
        ut,
      ],
      new: [
        {
          id: 2806,
          title: "Campus mode!!",
          difficulty: "master",
          score: 999999,
          clearMark: "HARD",
          fc: false,
          aj: false,
        },
        {
          id: 2757,
          title: "殺屋中毒",
          difficulty: "master",
          score: 974999,
          clearMark: null,
          fc: false,
          aj: false,
        },
        {
          id: 2712,
          title: "Theatore Creatore",
          difficulty: "ultima",
          score: 499999,
          clearMark: null,
          fc: false,
          aj: false,
        },
      ],
    }}
  />

  <button onclick={handleDownload}>Download</button>
</div>
