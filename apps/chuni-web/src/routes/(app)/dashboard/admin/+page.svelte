<script lang="ts">
  import { LoaderCircle, Trash2 } from "@lucide/svelte";

  import { enhance } from "$app/forms";

  let { form } = $props();

  let isClearing = $state(false);
  const adminSettingsMessageClass = $derived(
    form?.adminSettings?.status === "success"
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700",
  );
</script>

<div class="rounded-lg border border-gray-200/70 bg-white p-5 shadow-sm">
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="space-y-1">
      <h2 class="text-lg font-semibold text-gray-900">Admin Settings</h2>
      <p class="text-sm text-gray-600">Clear cached music and chart data.</p>
    </div>

    <form
      method="POST"
      action="?/clearAllCache"
      use:enhance={() => {
        isClearing = true;
        return async ({ update }) => {
          await update({ invalidateAll: true });
          isClearing = false;
        };
      }}
    >
      <button
        type="submit"
        disabled={isClearing}
        class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {#if isClearing}
          <LoaderCircle class="size-4 animate-spin" />
          Clearing...
        {:else}
          <Trash2 class="size-4" />
          Clear All Cache
        {/if}
      </button>
    </form>
  </div>

  {#if form?.adminSettings}
    <p class="mt-4 rounded-md px-3 py-2 text-sm {adminSettingsMessageClass}">
      {form.adminSettings.message}
    </p>
  {/if}
</div>
