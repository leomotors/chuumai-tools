<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "@repo/ui/atom/button";
</script>

<main class="flex min-h-[60vh] items-center justify-center px-4 py-8 font-app">
  <div class="mx-auto max-w-md text-center w-full">
    <div
      class="rounded-xl border border-red-200 bg-red-50/70 p-8 shadow-lg backdrop-blur-md"
    >
      <h1 class="mt-4 text-4xl font-bold text-red-700">
        {page.status}
      </h1>

      <p class="mt-2 text-lg font-medium text-red-600">
        {page.error?.message ?? "An unexpected error occurred"}
      </p>

      <div class="mt-6">
        <Button href="/" variant="outline">Go Home</Button>
      </div>
    </div>
  </div>
</main>
