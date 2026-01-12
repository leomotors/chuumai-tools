<script lang="ts">
  import {
    CircleAlert,
    CircleCheck,
    Download,
    RotateCcw,
  } from "@lucide/svelte";

  type Props = {
    userError: string | undefined;
    playerName: string | undefined;
    lastPlayed: string | Date | undefined;
    dataError: string | undefined;
    calculatedRating: number | undefined;
    onReload: () => unknown;
    handleDownload: () => unknown;
  };

  let {
    userError,
    playerName,
    lastPlayed,
    dataError,
    calculatedRating,
    onReload,
    handleDownload,
  }: Props = $props();
</script>

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

  {#if playerName && lastPlayed}
    <div class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex items-center">
        <CircleCheck class="w-5 h-5 text-green-400 mr-2" />
        <h3 class="text-sm font-medium text-green-800">
          File parsed successfully!
        </h3>
      </div>
      <div class="mt-2 text-sm text-green-700">
        <p>Player Name: {playerName}</p>
        <p>Last Played: {lastPlayed}</p>
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

  {#if calculatedRating !== undefined}
    <div class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <CircleCheck class="w-5 h-5 text-green-400 mr-2" />
          <div>
            <h3 class="text-sm font-medium text-green-800">
              Data fetched successfully, ready for render!
            </h3>
            <p class="text-sm text-green-700">
              Calculated Rating: {calculatedRating}
            </p>
          </div>
        </div>
        <button
          class="inline-flex items-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          onclick={onReload}
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
    disabled={calculatedRating === undefined}
  >
    <Download class="w-5 h-5 mr-2" />
    Generate and Download
  </button>
</div>

<style>
  pre {
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
