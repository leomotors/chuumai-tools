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

  const currentApiKey = $derived(
    formSuccess && formApiKey ? formApiKey : apiKey,
  );
</script>

<div class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm">
  <div class="mb-2.5 flex items-baseline justify-between gap-2">
    <div class="flex items-center gap-2">
      <Key class="size-4 text-gray-700" />
      <h2 class="text-sm font-semibold text-gray-900">API Key</h2>
    </div>
    {#if apiKeyCreatedAt}
      <span class="font-mono text-[10.5px] text-gray-400">
        Created {new Date(apiKeyCreatedAt).toLocaleString()}
      </span>
    {/if}
  </div>

  {#if currentApiKey}
    <div class="flex items-center gap-2">
      <div
        class="flex flex-1 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
      >
        <code
          class="flex-1 truncate font-mono text-xs tracking-wider text-gray-900"
        >
          {showApiKey ? currentApiKey : "•".repeat(32)}
        </code>
        <button
          type="button"
          onclick={() => (showApiKey = !showApiKey)}
          class="grid size-6 place-items-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          aria-label={showApiKey ? "Hide API key" : "Show API key"}
        >
          {#if showApiKey}
            <EyeOff class="size-3.5" />
          {:else}
            <Eye class="size-3.5" />
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
          class="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <RefreshCw class="size-3.5" />
          Regenerate
        </button>
      {/if}
    </div>
  {:else}
    <div class="space-y-3">
      <p class="text-sm text-gray-600">
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
          class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
        >
          <Key class="size-3.5" />
          Generate API Key
        </button>
      {/if}
    </div>
  {/if}

  <p class="mt-2.5 text-[11px] text-gray-400">
    By uploading your data, you agree that your data will be accessible by the
    website administrators.
  </p>
</div>
