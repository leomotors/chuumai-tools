<script lang="ts">
  import { Eye, EyeOff, Key, RefreshCw } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    apiKey: string | null;
    apiKeyCreatedAt: Date | null;
    formApiKey?: string | null;
    formSuccess?: boolean;
    onGenerate?: () => void;
    generateForm?: Snippet;
  }

  let {
    apiKey,
    apiKeyCreatedAt,
    formApiKey,
    formSuccess,
    onGenerate,
    generateForm,
  }: Props = $props();

  let showApiKey = $state(false);

  // Derive current API key from data or form
  const currentApiKey = $derived(
    formSuccess && formApiKey ? formApiKey : apiKey,
  );
</script>

<div
  class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
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

      {#if generateForm}
        {@render generateForm()}
      {:else}
        <button
          type="button"
          onclick={() => {
            showApiKey = true;
            onGenerate?.();
          }}
          class="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <RefreshCw class="size-4" />
          Regenerate API Key
        </button>
      {/if}

      {#if apiKeyCreatedAt}
        <p class="text-xs text-gray-500">
          Created: {new Date(apiKeyCreatedAt).toLocaleString()}
        </p>
      {/if}
    </div>
  {:else}
    <div class="space-y-4">
      <p class="text-gray-600">
        You don't have an API key yet. Generate one to access the API.
      </p>

      {#if generateForm}
        {@render generateForm()}
      {:else}
        <button
          type="button"
          onclick={() => {
            showApiKey = true;
            onGenerate?.();
          }}
          class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          <Key class="size-4" />
          Generate API Key
        </button>
      {/if}
    </div>
  {/if}

  <p class="mt-4 text-xs text-gray-500">
    By uploading your data, you agree that your data will be accessible by the
    website administrators.
  </p>
</div>
