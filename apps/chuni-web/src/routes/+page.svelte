<script lang="ts">
  import {
    CircleAlert,
    CircleCheck,
    Download,
    InfoIcon,
    Plus,
    RotateCcw,
    Upload,
    X,
  } from "@lucide/svelte";
  import { toPng } from "html-to-image";

  import ExtLink from "$lib/components/molecule/ExtLink.svelte";
  import { getVersionNameMapping } from "$lib/constants/index";
  import { getDefaultVersion, getEnabledVersions } from "$lib/version";

  import {
    clearMarkValues,
    type RatingType,
    stdChartDifficultyValues,
  } from "@repo/db-chuni/schema";
  import { type RawImageGen } from "@repo/types/chuni";
  import {
    type HiddenChart,
    type ImgGenInput,
    imgGenInputSchema,
  } from "@repo/types/chuni";

  import Render from "./Render.svelte";

  let files = $state<FileList>();
  let userData = $state<ImgGenInput>();
  let userError = $state<string>();

  let hiddenCharts = $state<HiddenChart[]>([]);

  const enabledVersions = getEnabledVersions();
  let selectedVersion = $state<string>(getDefaultVersion());

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
        version: selectedVersion,
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

<main
  class="flex flex-col items-center w-screen px-4 pb-16 pt-32 gap-6 font-app min-h-screen bg-gray-50"
>
  <div class="w-full max-w-4xl">
    <div class="text-center mb-8">
      <h1 class="font-bold text-4xl mb-4 text-gray-800">
        Chunithm Rating Image Generator
      </h1>

      <article class="space-y-2 text-gray-600">
        <p>
          GitHub: <ExtLink href="https://github.com/leomotors.chuumai-tools">
            leomotors/chuumai-tools
          </ExtLink>
        </p>
        <p>
          Web Version: {WEB_VERSION} (<ExtLink
            href="https://github.com/leomotors/chuumai-tools/blob/main/apps/chuni-web/CHANGELOG.md"
          >
            Changelog
          </ExtLink>)
        </p>
      </article>
    </div>

    <!-- Input Section -->
    <div class="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">Render Input</h2>

      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p class="text-sm text-blue-800">
          You can get JSON file by using my scraper. Please refer to
          <span class="font-medium underline">
            <ExtLink
              href="https://github.com/leomotors/chuumai-tools?tab=readme-ov-file#chunithm"
            >
              GitHub
            </ExtLink>
          </span>
          for more information.
        </p>

        <p class="text-sm text-blue-800">
          Third party data were used in this website. Please see details at <a
            href="/about"
            class="underline font-medium"
          >
            about
          </a> page. This page also includes terms of service and privacy policy,
          by using our service you agree to those terms.
        </p>
      </div>

      <!-- Version Selection -->
      <div class="space-y-2">
        <label for="version" class="block text-sm font-medium text-gray-700">
          Chart Constant Version
        </label>
        <select
          id="version"
          bind:value={selectedVersion}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {#if enabledVersions.length === 0}
            <option value="" disabled>Error: No versions available</option>
          {:else}
            {#each enabledVersions as version (version)}
              <option value={version}>{getVersionNameMapping(version)}</option>
            {/each}
          {/if}
        </select>
      </div>

      <!-- File Upload Section -->
      <div class="space-y-4">
        <div class="space-y-2">
          <label
            for="fileInput"
            class="block text-sm font-medium text-gray-700"
          >
            Upload JSON File
          </label>
          <div class="flex items-center justify-center w-full">
            <label
              for="fileInput"
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload class="w-8 h-8 mb-2 text-gray-400" />
                <p class="mb-2 text-sm text-gray-500">
                  <span class="font-semibold">Click to upload</span> your JSON file
                </p>
                <p class="text-xs text-gray-500">JSON files only</p>
              </div>
              <input
                class="hidden"
                type="file"
                accept=".json"
                id="fileInput"
                bind:files
              />
            </label>
          </div>

          {#if files && files.length > 0}
            <div class="text-sm text-green-600 flex items-center gap-1">
              <CircleCheck class="w-4 h-4" />
              File uploaded: {files[0].name}
            </div>
          {/if}
        </div>
      </div>

      <!-- Hidden Songs Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-800">Hidden Songs</h3>
          <button
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
            <Plus class="w-4 h-4 mr-1" />
            Add Hidden Song
          </button>
        </div>

        {#if hiddenCharts.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p>No hidden songs added yet.</p>
            <p class="text-sm">Click "Add Hidden Song" to get started.</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each hiddenCharts as chart, index (index)}
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
                >
                  <div class="space-y-1">
                    <label
                      for="rating-type-{index}"
                      class="block text-xs font-medium text-gray-700"
                      >Rating Type</label
                    >
                    <select
                      name="rating-type-{index}"
                      id="rating-type-{index}"
                      bind:value={chart.ratingType}
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option
                        value={"CURRENT" satisfies RatingType}
                        selected={chart.ratingType === "CURRENT"}
                      >
                        CURRENT
                      </option>
                      <option
                        value={"BEST" satisfies RatingType}
                        selected={chart.ratingType === "BEST"}
                      >
                        BEST
                      </option>
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label
                      for="search-{index}"
                      class="block text-xs font-medium text-gray-700"
                      >Search</label
                    >
                    <input
                      type="text"
                      bind:value={chart.search}
                      placeholder="Song title or artist"
                      id="search-{index}"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div class="space-y-1">
                    <label
                      for="difficulty-{index}"
                      class="block text-xs font-medium text-gray-700"
                      >Difficulty</label
                    >
                    <select
                      name="difficulty-{index}"
                      id="difficulty-{index}"
                      bind:value={chart.difficulty}
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {#each stdChartDifficultyValues as diff (diff)}
                        <option value={diff}>{diff.toUpperCase()}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label
                      for="score-{index}"
                      class="block text-xs font-medium text-gray-700"
                      >Score</label
                    >
                    <input
                      type="number"
                      bind:value={chart.score}
                      placeholder="Score"
                      id="score-{index}"
                      min="0"
                      max="1010000"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div class="space-y-1">
                    <label
                      for="clear-mark-{index}"
                      class="block text-xs font-medium text-gray-700"
                      >Clear Mark</label
                    >
                    <select
                      name="clear-mark-{index}"
                      id="clear-mark-{index}"
                      bind:value={chart.clearMark}
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={null}>None</option>
                      {#each clearMarkValues as mark (mark)}
                        <option value={mark}>{mark}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="flex items-center justify-center space-x-4">
                    <div class="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="fc-{index}"
                        bind:checked={chart.fc}
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        for="fc-{index}"
                        class="text-xs font-medium text-gray-700">FC</label
                      >
                    </div>

                    <div class="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="aj-{index}"
                        bind:checked={chart.aj}
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        for="aj-{index}"
                        class="text-xs font-medium text-gray-700">AJ</label
                      >
                    </div>
                  </div>

                  <div class="flex justify-end">
                    <button
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      onclick={() => {
                        hiddenCharts = hiddenCharts.filter(
                          (_, i) => i !== index,
                        );
                      }}
                    >
                      <X class="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Status Messages -->
    <div class="space-y-4 my-6">
      {#if userError}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex items-center">
            <CircleAlert class="w-5 h-5 text-red-400 mr-2" />
            <h3 class="text-sm font-medium text-red-800">JSON Parse Error</h3>
          </div>
          <div class="mt-2 text-sm text-red-700">
            <p class="mb-1">Error Parsing JSON File! Please check schema</p>
            <pre
              class="whitespace-pre-wrap font-mono text-xs bg-red-100 p-2 rounded overflow-x-auto">{userError}</pre>
          </div>
        </div>
      {/if}

      {#if userData}
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex items-center">
            <CircleCheck class="w-5 h-5 text-green-400 mr-2" />
            <h3 class="text-sm font-medium text-green-800">
              File parsed successfully!
            </h3>
          </div>
          <div class="mt-2 text-sm text-green-700">
            <p>Player Name: {userData.profile.playerName}</p>
            <p>Last Played: {userData.profile.lastPlayed}</p>
          </div>
        </div>
      {/if}

      {#if dataError}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex items-center">
            <CircleAlert class="w-5 h-5 text-red-400 mr-2" />
            <h3 class="text-sm font-medium text-red-800">Rating Data Error</h3>
          </div>
          <div class="mt-2 text-sm text-red-700">
            <p class="mb-1">Error Fetching Rating Data!</p>
            <pre
              class="whitespace-pre-wrap font-mono text-xs bg-red-100 p-2 rounded overflow-x-auto">{dataError}</pre>
          </div>
        </div>
      {/if}

      {#if renderData}
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <CircleCheck class="w-5 h-5 text-green-400 mr-2" />
              <div>
                <h3 class="text-sm font-medium text-green-800">
                  Data fetched successfully, ready for render!
                </h3>
                <p class="text-sm text-green-700">
                  Calculated Rating: {renderData.rating.totalAvg}
                </p>
              </div>
            </div>
            <button
              class="inline-flex items-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              onclick={() => {
                renderData = undefined;
                if (userData) getRatingData(userData);
              }}
            >
              <RotateCcw class="w-4 h-4 mr-1" />
              Reload
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Generate Button -->
    <div class="flex justify-center">
      <button
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        onclick={handleDownload}
        disabled={!renderData}
      >
        <Download class="w-5 h-5 mr-2" />
        Generate and Download
      </button>
    </div>

    <!-- Render Component -->
    {#if renderData}
      <div class="mt-8">
        <Render input={renderData} version={selectedVersion} />
      </div>
    {/if}
  </div>
</main>

<style>
  pre {
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
