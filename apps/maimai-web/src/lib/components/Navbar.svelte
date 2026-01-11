<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import { signIn, signOut } from "@auth/sveltekit/client";

  import NavBar from "@repo/ui/templates/NavBar.svelte";

  let { session }: { session: Session | null } = $props();
</script>

<NavBar
  title="Washing Machine"
  user={session?.user}
  signIn={() => signIn("discord")}
  {signOut}
>
  {#snippet navigationLinks()}
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
