<script lang="ts">
  import { CircleAlert, Download, Upload } from "@lucide/svelte";

  import { getVersionNameMapping } from "$lib/constants";
  import { getEnabledVersions } from "$lib/version";

  import {
    type FullPlayDataInput,
    fullPlayDataInputSchema,
  } from "@repo/types/chuni";

  let files = $state<FileList>();
  let jsonData = $state<FullPlayDataInput>();
  let parseError = $state<string>();
  let submissionError = $state<string>();
  let isSubmitting = $state(false);

  const enabledVersions = getEnabledVersions();
  let selectedVersion = $state<string>(enabledVersions[0]);

  async function parseFile(fileList: FileList) {
    const file = fileList[0];

    try {
      const content = await file.text();
      jsonData = fullPlayDataInputSchema.parse(JSON.parse(content));
      parseError = undefined;
    } catch (error) {
      jsonData = undefined;
      parseError =
        error instanceof Error ? error.message : "Failed to parse JSON file";
    }
  }

  $effect(() => {
    if (files && files.length > 0) {
      parseFile(files);
    }
  });

  async function handleSubmit() {
    if (!jsonData) {
      submissionError = "Please upload a valid JSON file first";
      return;
    }

    if (!selectedVersion) {
      submissionError = "Please select a version";
      return;
    }

    isSubmitting = true;
    submissionError = undefined;

    try {
      const response = await fetch("/api/previewNext", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: jsonData,
          version: selectedVersion,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          submissionError = JSON.stringify(errorJson, null, 2);
        } catch {
          submissionError =
            errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        return;
      }

      const result = await response.json();

      // Download the result as JSON file
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `preview-next-${selectedVersion}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      submissionError =
        error instanceof Error ? error.message : "An unexpected error occurred";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<main
  class="flex flex-col items-center w-screen px-4 pb-16 pt-32 gap-6 font-app min-h-screen bg-gray-50"
>
  <div class="w-full max-w-2xl">
    <h1 class="font-bold text-3xl text-center mb-2 text-gray-800">
      Preview Next Version
    </h1>
    <p class="text-gray-600 text-center mb-8">
      Upload your play data JSON file and preview the next version calculations
    </p>

    <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
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

      <!-- File Upload -->
      <div class="space-y-2">
        <label for="fileInput" class="block text-sm font-medium text-gray-700">
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
              id="fileInput"
              type="file"
              accept=".json"
              bind:files
              class="hidden"
            />
          </label>
        </div>

        {#if files && files.length > 0}
          <div class="text-sm text-green-600">
            ✓ File uploaded: {files[0].name}
          </div>
        {/if}
      </div>

      <!-- Parse Error Display -->
      {#if parseError}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex items-center">
            <CircleAlert class="w-5 h-5 text-red-400 mr-2" />
            <h3 class="text-sm font-medium text-red-800">JSON Parse Error</h3>
          </div>
          <div class="mt-2 text-sm text-red-700">
            <pre
              class="whitespace-pre-wrap font-mono text-xs bg-red-100 p-2 rounded overflow-x-auto">{parseError}</pre>
          </div>
        </div>
      {/if}

      <!-- Submission Error Display -->
      {#if submissionError}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex items-center">
            <CircleAlert class="w-5 h-5 text-red-400 mr-2" />
            <h3 class="text-sm font-medium text-red-800">Submission Error</h3>
          </div>
          <div class="mt-2 text-sm text-red-700">
            <pre
              class="whitespace-pre-wrap font-mono text-xs bg-red-100 p-2 rounded overflow-x-auto max-h-64 overflow-y-auto">{submissionError}</pre>
          </div>
        </div>
      {/if}

      <!-- Submit Button -->
      <button
        type="button"
        onclick={handleSubmit}
        disabled={!jsonData || !selectedVersion || isSubmitting}
        class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {#if isSubmitting}
          <div
            class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
          ></div>
          Processing...
        {:else}
          <Download class="w-4 h-4 mr-2" />
          Generate and Download Preview
        {/if}
      </button>

      <p class="text-sm text-gray-500 text-center">
        The processed result will be automatically downloaded as a JSON file.
      </p>
    </div>
  </div>
</main>

<style>
  pre {
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
