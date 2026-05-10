<script lang="ts">
  import { Settings } from "@lucide/svelte";

  interface User {
    id: string | null;
    name?: string | null;
    image?: string | null;
  }

  interface MetaItem {
    label: string;
    /** Hex/CSS color for an optional leading dot. */
    dotColor?: string;
  }

  interface Props {
    user: User;
    /**
     * Optional meta line shown under the name/ID, separated by middots.
     * E.g. `[{label: "256 jobs"}, {label: "last play 2h ago"}]`.
     */
    meta?: MetaItem[];
    /**
     * If provided, shows a settings cog button in the top-right.
     * Useful for toggling an API-key drawer.
     */
    onSettings?: () => void;
    settingsActive?: boolean;
  }

  let { user, meta, onSettings, settingsActive }: Props = $props();
</script>

<div
  class="relative flex items-center gap-4 rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm"
>
  {#if user.image}
    <img
      src={user.image}
      alt={user.name ?? "User"}
      class="size-14 shrink-0 rounded-full"
    />
  {:else}
    <div
      class="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-purple-500 text-xl font-bold text-white"
    >
      {user.name?.charAt(0).toUpperCase() ?? "U"}
    </div>
  {/if}
  <div class="min-w-0 flex-1">
    <div class="truncate text-base font-bold tracking-tight text-gray-900">
      {user.name}
    </div>
    <div class="truncate font-mono text-[10.5px] text-gray-400">
      ID · {user.id ?? "N/A"}
    </div>
    {#if meta && meta.length > 0}
      <div
        class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-gray-500"
      >
        {#each meta as item, i (i)}
          {#if i > 0}
            <span class="text-gray-300">·</span>
          {/if}
          <span class="inline-flex items-center gap-1">
            {#if item.dotColor}
              <span
                class="size-1.5 rounded-full"
                style:background-color={item.dotColor}
                aria-hidden="true"
              ></span>
            {/if}
            {item.label}
          </span>
        {/each}
      </div>
    {/if}
  </div>
  {#if onSettings}
    <button
      type="button"
      onclick={onSettings}
      title="API Key"
      aria-label="Toggle API Key panel"
      aria-pressed={settingsActive}
      class="absolute top-3 right-3 grid size-8 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 aria-pressed:bg-gray-100 aria-pressed:text-gray-900"
    >
      <Settings class="size-4" />
    </button>
  {/if}
</div>
