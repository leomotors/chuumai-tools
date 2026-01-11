<script lang="ts">
  import { Button } from "@repo/ui/atom/button";

  type Props = {
    status: number;
    message?: string;
  };

  let { status, message }: Props = $props();
</script>

<main
  class="flex min-h-screen bg-gray-50 items-center justify-center px-4 py-8 font-app"
>
  <div class="mx-auto max-w-md text-center w-full">
    <div
      class="rounded-xl border border-red-200 bg-red-50/70 p-8 shadow-lg backdrop-blur-md"
    >
      <h1 class="mt-4 text-4xl font-bold text-red-700">
        {status}
      </h1>

      <p class="mt-2 text-lg font-medium text-red-600">
        {message || "An unexpected error occurred"}
      </p>

      <div class="mt-6">
        <Button href="/" variant="outline">Go Home</Button>
      </div>
    </div>
  </div>
</main>
