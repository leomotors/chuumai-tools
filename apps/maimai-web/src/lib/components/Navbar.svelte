<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import { signIn, signOut } from "@auth/sveltekit/client";

  import { page } from "$app/state";
  import { env } from "$env/dynamic/public";

  import { getSwapUrl } from "@repo/core/web";
  import { NavDropdown } from "@repo/ui/molecule/NavDropdown";
  import NavBar from "@repo/ui/templates/NavBar.svelte";

  let { session }: { session: Session | null } = $props();

  const swapUrl = $derived(getSwapUrl(env.PUBLIC_CHUNI_URL, page.url.pathname));
</script>

<NavBar
  title="Washing Machine"
  user={session?.user}
  signIn={() => signIn("discord")}
  {signOut}
  {swapUrl}
  swapTooltip="Switch to Chunithm"
  currentPath={page.url.pathname}
>
  {#snippet navigationLinks()}
    <NavDropdown
      label="Tools"
      links={[
        { href: "/tools/rating", label: "Rating Calculator" },
        { href: "/tools/preview-next", label: "Preview Next" },
      ]}
    />

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
