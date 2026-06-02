<script lang="ts">
  import { Key, RefreshCw } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { enhance } from "$app/forms";
  import DashboardNav from "$lib/components/dashboard/DashboardNav.svelte";
  import DashboardSummary from "$lib/components/dashboard/DashboardSummary.svelte";

  import { ApiKeySection } from "@repo/ui/molecule/ApiKeySection";

  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  let isGenerating = $state(false);
  let showKey = $state(false);

  const hasApiKey = $derived(data.apiKey);
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <DashboardSummary
    user={data.user}
    jobCount={data.jobCount}
    userStats={data.userStats}
    settingsActive={showKey}
    onSettings={() => (showKey = !showKey)}
  />

  {#if showKey}
    <section>
      <ApiKeySection
        apiKey={data.apiKey}
        apiKeyCreatedAt={data.apiKeyCreatedAt}
        formSuccess={undefined}
      >
        {#snippet generateForm()}
          <form
            method="POST"
            action="/dashboard?/generateApiKey"
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
    </section>
  {/if}

  <DashboardNav />
  {@render children()}
</div>
