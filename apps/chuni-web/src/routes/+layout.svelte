<script lang="ts">
  import "@repo/ui/globals.css";
  import "../app.css";

  import type { Snippet } from "svelte";

  import Navbar from "$lib/components/Navbar.svelte";

  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="fixed top-0 z-50 w-full">
  <Navbar session={data.session} />
</div>

{@render children()}
