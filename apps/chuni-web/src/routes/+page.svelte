<script lang="ts">
  import { toPng } from "html-to-image";

  import { env } from "$env/dynamic/public";
  import { type RawImageGen } from "$lib/types";

  import { type ImgGenInput, imgGenInputSchema } from "@repo/types-chuni";

  import Render from "./Render.svelte";

  let files = $state<FileList>();
  let userData = $state<ImgGenInput>();
  let userError = $state<string>();

  async function parseFile(fileList: FileList) {
    const file = fileList[0];

    const content = await file.text();
    const json = JSON.parse(content);
    const parseResult = imgGenInputSchema.safeParse(json);

    if (parseResult.success) {
      userData = parseResult.data;
      userError = undefined;
    } else {
      userData = undefined;
      userError = parseResult.error.message;
    }
  }

  $effect(() => {
    if (files) {
      parseFile(files);
    }
  });

  let renderData = $state<RawImageGen>();

  async function getRatingData(userData: ImgGenInput) {
    const res = await fetch("/api/calcRating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: userData,
        version: "VRS",
      }),
    });

    renderData = await res.json();
  }

  $effect(() => {
    if (userData) {
      getRatingData(userData);
    }
  });

  async function handleDownload() {
    const element = document.getElementById("chart")!;

    element.style.display = "flex";
    const dataUrl = await toPng(element);
    element.style.display = "none";

    // Download
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  }
</script>

<main class="flex flex-col items-center w-screen px-4 py-8 gap-4">
  <h1 class="font-bold text-3xl">Chunithm Music for Rating Image Generator</h1>
  <p>Version: {env.PUBLIC_VERSION}</p>

  <div
    class="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl"
  >
    <label class="font-bold" for="fileInput">Upload JSON File</label>
    <input
      class="border border-black p-2 rounded-lg"
      type="file"
      accept=".json"
      id="fileInput"
      bind:files
    />

    <p>
      JSON file should match
      <a
        class="text-blue-500 hover:underline"
        href="https://github.com/leomotors/chuumai-tools/blob/main/packages/types-chuni/src/index.ts"
        target="_blank"
        rel="noreferrer"
      >
        following schema
      </a>
    </p>
  </div>

  {#if userError}
    <p class="text-red-500">Error Parsing JSON File! Please check schema</p>
    <p>{userError}</p>
  {/if}

  {#if userData}
    <section class="flex flex-col items-center">
      <p class="text-green-500">File parsed successfully!</p>
      <p>Player Name: {userData.profile.playerName}</p>
      <p>Last Played: {userData.profile.lastPlayed}</p>
    </section>
  {/if}

  {#if renderData}
    <section class="flex flex-col items-center">
      <p class="text-green-500">Data fetched successfully, ready for render!</p>
      <p>Rating: {renderData.rating.totalAvg}</p>
    </section>
  {/if}

  <button
    class="bg-blue-300 rounded-lg p-2 disabled:bg-gray-300 hover:bg-blue-400 transition-colors disabled:cursor-not-allowed"
    onclick={handleDownload}
    disabled={!renderData}
  >
    Generate and Download
  </button>

  {#if renderData}
    <Render input={renderData} />
  {/if}
</main>
