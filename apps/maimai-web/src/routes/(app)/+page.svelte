<script lang="ts">
  import { CircleCheck, Upload } from "@lucide/svelte";

  import { getVersionNameMapping } from "$lib/constants";
  import { getDefaultVersion, getEnabledVersions } from "$lib/version";

  import { ExtLink } from "@repo/ui/molecule/ExtLink";

  let files = $state<FileList>();

  const enabledVersions = getEnabledVersions();
  let selectedVersion = $state<string>(getDefaultVersion());
</script>

<div class="w-full max-w-4xl">
  <div class="text-center mb-8">
    <h1 class="font-bold text-4xl mb-4 text-gray-800">
      maimai Rating Image Generator
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
        </a> page. This page also includes terms of service and privacy policy, by
        using our service you agree to those terms.
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
  </div>
</div>
