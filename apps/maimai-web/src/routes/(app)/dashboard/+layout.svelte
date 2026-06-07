<script lang="ts">
  import type { Snippet } from "svelte";

  import DashboardNav from "$lib/components/dashboard/DashboardNav.svelte";
  import DashboardSummary from "$lib/components/dashboard/DashboardSummary.svelte";

  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
  <DashboardSummary
    user={data.user}
    jobCount={data.jobCount}
    userStats={data.userStats}
  />

  <DashboardNav />
  {@render children()}
</div>
