<script lang="ts">
  interface User {
    id: string | null;
    name?: string | null;
    image?: string | null;
  }

  interface Props {
    user: User;
  }

  let { user }: Props = $props();
</script>

<div
  class="rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
>
  <div class="flex items-center gap-4">
    {#if user.image}
      <img
        src={user.image}
        alt={user.name ?? "User"}
        class="size-16 rounded-full"
      />
    {:else}
      <div
        class="flex size-16 items-center justify-center rounded-full bg-gray-300 text-xl font-medium text-gray-600"
      >
        {user.name?.charAt(0).toUpperCase() ?? "U"}
      </div>
    {/if}
    <div class="space-y-1">
      <h1 class="text-xl font-bold text-gray-800">
        {user.name}
      </h1>
      <p class="text-sm text-gray-500">
        ID: {user.id ?? "N/A"}
      </p>
    </div>
  </div>
</div>
