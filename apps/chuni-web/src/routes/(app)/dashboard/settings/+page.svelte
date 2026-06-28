<script lang="ts">
  import { Key, RefreshCw } from "@lucide/svelte";

  import { enhance } from "$app/forms";
  import { formatChuniRating } from "$lib/utils/chuniRating";

  import { ApiKeySection } from "@repo/ui/molecule/ApiKeySection";
  import { ManualRatingUploadSection } from "@repo/ui/molecule/ManualRatingUploadSection";

  let { data, form } = $props();

  let isGenerating = $state(false);
  const hasApiKey = $derived(data.apiKey);
</script>

<div class="space-y-4">
  <ApiKeySection
    apiKey={data.apiKey}
    apiKeyCreatedAt={data.apiKeyCreatedAt}
    formSuccess={undefined}
  >
    {#snippet generateForm()}
      <form
        method="POST"
        action="?/generateApiKey"
        use:enhance={() => {
          isGenerating = true;
          return async ({ update }) => {
            await update({ invalidateAll: true });
            isGenerating = false;
          };
        }}
      >
        <button
          type="submit"
          disabled={isGenerating}
          class="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 {hasApiKey
            ? 'bg-orange-500 hover:bg-orange-600'
            : 'bg-blue-500 hover:bg-blue-600'}"
        >
          {#if hasApiKey}
            <RefreshCw class="size-3.5" />
            {isGenerating ? "Regenerating..." : "Regenerate"}
          {:else}
            <Key class="size-3.5" />
            {isGenerating ? "Generating..." : "Generate API Key"}
          {/if}
        </button>
      </form>
    {/snippet}
  </ApiKeySection>

  <ManualRatingUploadSection
    state={form?.manualRatingUpload}
    ratingLabel="Rating"
    ratingDescription="Upload a CSV with or without headers. The preview will infer the timestamp and CHUNITHM decimal rating columns before anything is inserted."
    formatRating={formatChuniRating}
  />
</div>
