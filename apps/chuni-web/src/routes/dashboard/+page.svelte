<script lang="ts">
  let { data } = $props();
</script>

<main class="px-4 py-8 font-app">
  <div class="mx-auto max-w-2xl">
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

    <!-- Jobs Placeholder -->
    <div
      class="mt-6 rounded-xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-md"
    >
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Your Jobs</h2>
      <p class="text-gray-600">
        You have <span class="font-bold">{data.jobCount}</span> jobs associated with
        your account.
      </p>
    </div>
  </div>
</main>
