<script lang="ts">
  import { Key, RefreshCw } from "@lucide/svelte";

  import { enhance } from "$app/forms";
  import StatsChart from "$lib/components/StatsChart.svelte";

  import { ApiKeySection } from "@repo/ui/molecule/ApiKeySection";
  import { UserProfileCard } from "@repo/ui/molecule/UserProfileCard";

  let { data, form } = $props();

  let isGenerating = $state(false);
  let showApiKey = $state(false);

  // Derive if there's an API key (current or newly generated)
  const hasApiKey = $derived(data.apiKey || (form?.success && form?.apiKey));
</script>

<div class="mx-auto max-w-2xl w-full">
  <!-- User Profile Card -->
  <UserProfileCard user={data.user} />

  <!-- API Key Section -->
  <div class="mt-6">
    <ApiKeySection
      apiKey={data.apiKey}
      apiKeyCreatedAt={data.apiKeyCreatedAt}
      formApiKey={form?.apiKey}
      formSuccess={form?.success}
    >
      {#snippet generateForm()}
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
            class="flex items-center gap-2 rounded-lg {hasApiKey
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-500 hover:bg-blue-600'} px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {#if hasApiKey}
              <RefreshCw class="size-4" />
              {isGenerating ? "Regenerating..." : "Regenerate API Key"}
            {:else}
              <Key class="size-4" />
              {isGenerating ? "Generating..." : "Generate API Key"}
            {/if}
          </button>
        </form>
      {/snippet}
    </ApiKeySection>
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
