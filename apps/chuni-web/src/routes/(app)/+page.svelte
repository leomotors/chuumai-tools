<script lang="ts">
  import { Plus, X } from "@lucide/svelte";
  import { toPng } from "html-to-image";

  import { page } from "$app/state";
  import Render from "$lib/components/Render.svelte";
  import { getVersionNameMapping } from "$lib/constants/index";
  import { getDefaultVersion, getEnabledVersions } from "$lib/version";

  import { handleDownload as handleDownloadBase } from "@repo/core/web";
  import {
    clearMarkValues,
    type RatingType,
    stdChartDifficultyValues,
  } from "@repo/types/chuni";
  import { type RawImageGen } from "@repo/types/chuni";
  import {
    type HiddenChart,
    type ImgGenInput,
    imgGenInputSchema,
  } from "@repo/types/chuni";
  import Header from "@repo/ui/templates/RenderPage/Header.svelte";
  import InputSection from "@repo/ui/templates/RenderPage/InputSection.svelte";
  import StatusMessage from "@repo/ui/templates/RenderPage/StatusMessage.svelte";

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

  const handleDownload = () =>
    handleDownloadBase("chart", toPng, !!page.url.searchParams.get("debug"));
</script>

<div class="w-full max-w-4xl">
  <Header
    title="Chunithm Rating Image Generator"
    webVersion={WEB_VERSION}
    projectPath="apps/chuni-web"
  />

  <!-- Input Section -->
  <InputSection
    docsHash="chunithm"
    bind:selectedVersion
    {enabledVersions}
    {getVersionNameMapping}
    bind:files
  >
    <!-- Hidden Songs Section -->
    {#snippet contentAfter()}
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
    {/snippet}
  </InputSection>

  <!-- Status Messages -->
  <StatusMessage
    {userError}
    playerName={userData?.profile.playerName}
    lastPlayed={userData?.profile.lastPlayed}
    {dataError}
    calculatedRating={renderData?.rating.totalAvg}
    onReload={() => {
      renderData = undefined;
      if (userData) getRatingData(userData);
    }}
    {handleDownload}
  />

  <!-- Render Component -->
  {#if renderData}
    <div class="mt-8">
      <Render
        input={renderData}
        version={selectedVersion}
        scraperVersion={userData?.scraperVersion}
      />
    </div>
  {/if}
</div>
