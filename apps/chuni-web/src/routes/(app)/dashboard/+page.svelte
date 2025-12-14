<script lang="ts">
  import { Eye, EyeOff, Key, RefreshCw } from "@lucide/svelte";

  import { enhance } from "$app/forms";
  import StatsChart from "$lib/components/StatsChart.svelte";

  let { data, form } = $props();

  let showApiKey = $state(false);
  let isGenerating = $state(false);

  // Derive current API key from data or form
  const currentApiKey = $derived(
    form?.success && form?.apiKey ? form.apiKey : data.apiKey,
  );
</script>

<div class="mx-auto max-w-2xl w-full">
  <!-- User Profile Card -->
  <div
    class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
  >
    <div class="flex items-center gap-4">
      {#if data.user.image}
        <img
          src={data.user.image}
          alt={data.user.name ?? "User"}
          class="size-16 rounded-full"
        />
      {:else}
        <div
          class="flex size-16 items-center justify-center rounded-full bg-gray-300 text-xl font-medium text-gray-600"
        >
          {data.user.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
      {/if}
      <div class="space-y-1">
        <h1 class="text-xl font-bold text-gray-800">
          {data.user.name}
        </h1>
        <p class="text-sm text-gray-500">
          ID: {data.user.id ?? "N/A"}
        </p>
      </div>
    </div>
  </div>

  <!-- API Key Section -->
  <div
    class="mt-6 rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
  >
    <div class="mb-4 flex items-center gap-2">
      <Key class="size-5 text-gray-700" />
      <h2 class="text-lg font-semibold text-gray-800">API Key</h2>
    </div>

    {#if currentApiKey}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <div
            class="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 font-mono text-sm"
          >
            {#if showApiKey}
              {currentApiKey}
            {:else}
              {"•".repeat(32)}
            {/if}
          </div>
          <button
            type="button"
            onclick={() => (showApiKey = !showApiKey)}
            class="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50"
            aria-label={showApiKey ? "Hide API key" : "Show API key"}
          >
            {#if showApiKey}
              <EyeOff class="size-5 text-gray-600" />
            {:else}
              <Eye class="size-5 text-gray-600" />
            {/if}
          </button>
        </div>

        <form
          method="POST"
          action="?/generateApiKey"
          use:enhance={() => {
            isGenerating = true;
            return async ({ update }) => {
              await update();
              isGenerating = false;
              showApiKey = true;
            };
          }}
        >
          <button
            type="submit"
            disabled={isGenerating}
            class="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <RefreshCw class="size-4" />
            {isGenerating ? "Regenerating..." : "Regenerate API Key"}
          </button>
        </form>

        {#if data.apiKeyCreatedAt}
          <p class="text-xs text-gray-500">
            Created: {new Date(data.apiKeyCreatedAt).toLocaleString()}
          </p>
        {/if}
      </div>
    {:else}
      <div class="space-y-4">
        <p class="text-gray-600">
          You don't have an API key yet. Generate one to access the API.
        </p>

        <form
          method="POST"
          action="?/generateApiKey"
          use:enhance={() => {
            isGenerating = true;
            return async ({ update }) => {
              await update();
              isGenerating = false;
              showApiKey = true;
            };
          }}
        >
          <button
            type="submit"
            disabled={isGenerating}
            class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <Key class="size-4" />
            {isGenerating ? "Generating..." : "Generate API Key"}
          </button>
        </form>
      </div>
    {/if}

    <p class="mt-4 text-xs text-gray-500">
      By uploading your data, you agree that your data will be accessible by the
      website administrators.
    </p>
  </div>

  <!-- Stats Chart Section -->
  {#if data.userStats && data.userStats.length > 0}
    <div class="mt-6">
      {#snippet statsHeader()}
        <p class="text-gray-600">
          You have <span class="font-bold">{data.jobCount}</span> jobs associated
          with your account.
        </p>
      {/snippet}
      <StatsChart userStats={data.userStats} header={statsHeader} />
    </div>
  {/if}
</div>
