<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import { signIn, signOut } from "@auth/sveltekit/client";
  import { ChevronDown } from "@lucide/svelte";

  import * as Popover from "@repo/ui/atom/popover";
  import NavBar from "@repo/ui/templates/NavBar.svelte";

  let { session }: { session: Session | null } = $props();

  let toolsOpen = $state(false);
</script>

<NavBar
  title="Washing Machine"
  user={session?.user}
  signIn={() => signIn("discord")}
  {signOut}
>
  {#snippet navigationLinks()}
    <Popover.Root bind:open={toolsOpen}>
      <Popover.Trigger
        class="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
      >
        Tools
        <ChevronDown class="size-4" />
      </Popover.Trigger>
      <Popover.Content
        class="w-48 rounded-xl border border-gray-200/50 bg-white/70 p-2 shadow-lg backdrop-blur-md"
      >
        <a
          href="/tools/rating"
          onclick={() => (toolsOpen = false)}
          class="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          Rating Calculator
        </a>
      </Popover.Content>
    </Popover.Root>

    <a
      href="/data"
      class="text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
    >
      Data
    </a>

    <a
      href="/api/docs/index.html"
      class="text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
    >
      API
    </a>

    <a
      href="/about"
      class="text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
    >
      About
    </a>
  {/snippet}
</NavBar>
