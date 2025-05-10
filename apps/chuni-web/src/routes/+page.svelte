<script lang="ts">
  import { toPng } from "html-to-image";

  import { env } from "$env/dynamic/public";
  import ExtLink from "$lib/components/molecule/ExtLink.svelte";
  import { type RawImageGen } from "$lib/types";
  import { webVersion } from "$lib/version.js";

  import {
    clearMarkValues,
    type RatingType,
    stdChartDifficultyValues,
  } from "@repo/db-chuni/schema";
  import {
    type HiddenChart,
    type ImgGenInput,
    imgGenInputSchema,
  } from "@repo/types-chuni";

  import Render from "./Render.svelte";

  let files = $state<FileList>();
  let userData = $state<ImgGenInput>();
  let userError = $state<string>();

  let hiddenCharts = $state<HiddenChart[]>([]);

  async function parseFile(fileList: FileList) {
    const file = fileList[0];

    const content = await file.text();
    const json = JSON.parse(content);
    const parseResult = imgGenInputSchema.safeParse(json);

    if (parseResult.success) {
      userData = parseResult.data;
      userError = undefined;
      getRatingData(userData);
    } else {
      userData = undefined;
      userError = parseResult.error.message;
    }
  }

  $effect(() => {
    if (files && files.length > 0) {
      parseFile(files);
    }
  });

  let renderData = $state<RawImageGen>();

  let dataError = $state<string>();

  async function getRatingData(userData: ImgGenInput) {
    const res = await fetch("/api/calcRating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          ...userData,
          hidden: [
            ...(userData.hidden ?? []),
            ...hiddenCharts.filter((chart) => chart.score > 0),
          ],
        },
        version: "VRS",
      }),
    });

    if (!res.ok) {
      console.error("Error fetching rating data:", res.statusText);
      dataError = `${res.statusText} ${await res.text()}`;
      return;
    }

    renderData = await res.json();
  }

  async function ensureImageLoaded(element: HTMLElement) {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map((img) => {
        if (img.complete) {
          return Promise.resolve(); // Already loaded
        }
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error(`Failed to load image: ${img.src}`));
        });
      }),
    );

    await document.fonts.ready; // Ensure all fonts are loaded
  }

  async function handleDownload() {
    const element = document.getElementById("chart")!;

    element.style.display = "flex";
    await ensureImageLoaded(element);
    const dataUrl = await toPng(element);
    element.style.display = "none";

    // Download
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = dataUrl;
    link.click();
  }
</script>

<main class="flex flex-col items-center w-screen px-4 py-8 gap-4 font-app">
  <h1 class="font-bold text-3xl">Chunithm Music for Rating Image Generator</h1>

  <article class="flex flex-col items-center">
    <p>
      By <ExtLink href="https://github.com/leomotors">Leomotors</ExtLink>
    </p>
    <p>
      Web Version: {webVersion} (<ExtLink
        href="https://github.com/leomotors/chuumai-tools/blob/main/apps/chuni-web/CHANGELOG.md"
      >
        Changelog
      </ExtLink>)
    </p>
    <p>Chart Constant Version: {env.PUBLIC_VERSION || "???"}</p>
  </article>

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
      Please refer to
      <ExtLink
        href="https://github.com/leomotors/chuumai-tools?tab=readme-ov-file#chunithm"
      >
        GitHub
      </ExtLink>
      for the schema and how to get the JSON file.
    </p>

    <section class="flex flex-col items-center gap-2 w-full">
      <p class="font-bold">Hidden Songs</p>

      {#each hiddenCharts as chart, index (index)}
        <div class="hiddenCharts">
          <div>
            <label for="rating-type-{index}">Type</label>
            <select
              name="rating-type-{index}"
              id="rating-type-{index}"
              bind:value={chart.ratingType}
            >
              <option
                value={"CURRENT" satisfies RatingType}
                selected={chart.ratingType === "CURRENT"}
              >
                CURRENT
              </option>
              <option
                value={"BEST" satisfies RatingType}
                selected={chart.ratingType === "BEST"}>BEST</option
              >
            </select>
          </div>
          <div>
            <label for="search-{index}">Search</label>
            <input
              type="text"
              bind:value={chart.search}
              placeholder="Search"
              id="search-{index}"
            />
          </div>
          <div>
            <label for="difficulty-{index}">Difficulty</label>
            <select
              name="difficulty-{index}"
              id="difficulty-{index}"
              bind:value={chart.difficulty}
            >
              {#each stdChartDifficultyValues as difficulty (difficulty)}
                <option
                  value={difficulty}
                  selected={chart.difficulty === difficulty}
                >
                  {difficulty.toUpperCase()}
                </option>
              {/each}
            </select>
          </div>
          <div>
            <label for="score-{index}">Score</label>
            <input
              type="number"
              bind:value={chart.score}
              placeholder="Score"
              id="score-{index}"
            />
          </div>
          <div>
            <label for="clearmark-{index}">Clear Mark</label>
            <select
              name="clearmark-{index}"
              id="clearmark-{index}"
              bind:value={chart.clearMark}
            >
              <option value={null} selected={!!chart.clearMark}>NONE</option>
              {#each clearMarkValues as clearMark (clearMark)}
                <option
                  value={clearMark}
                  selected={chart.clearMark === clearMark}
                >
                  {clearMark}
                </option>
              {/each}
            </select>
          </div>
          <div>
            <label for="fc-{index}">FC</label>
            <input type="checkbox" id="fc-{index}" bind:checked={chart.fc} />
          </div>
          <div>
            <label for="aj-{index}">AJ</label>
            <input type="checkbox" id="aj-{index}" bind:checked={chart.aj} />
          </div>
          <button
            class="bg-red-500 rounded-lg p-2 hover:bg-red-600 transition-colors text-white h-fit self-center"
            onclick={() => {
              hiddenCharts = hiddenCharts.filter((_, i) => i !== index);
            }}
          >
            RM
          </button>
        </div>
      {/each}

      <button
        class="self-end bg-blue-500 rounded-lg p-2 hover:bg-blue-600 transition-colors text-white"
        onclick={() => {
          hiddenCharts = [
            ...hiddenCharts,
            {
              search: "",
              difficulty: "master",
              ratingType: "CURRENT",
              score: 0,
              clearMark: null,
              fc: false,
              aj: false,
            },
          ];
        }}
      >
        Add
      </button>
    </section>
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

  {#if dataError}
    <p class="text-red-500">Error Fetching Rating Data!</p>
    <p>{dataError}</p>
  {/if}

  {#if renderData}
    <section class="flex flex-col items-center">
      <p class="text-green-500">Data fetched successfully, ready for render!</p>
      <p>Rating: {renderData.rating.totalAvg}</p>

      <button
        class="bg-blue-300 p-2 rounded-lg hover:bg-blue-400 transition-colors"
        onclick={() => {
          renderData = undefined;
          if (userData) getRatingData(userData);
        }}
      >
        Reload
      </button>
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

<style lang="postcss">
  @reference "tailwindcss";

  .hiddenCharts {
    @apply flex flex-row gap-2;

    & > div {
      @apply flex flex-col items-start gap-1;

      & > input,
      & > select {
        @apply border border-black p-2 rounded-lg;
      }

      & > input[type="checkbox"] {
        @apply w-6 h-6;
      }
    }
  }
</style>
