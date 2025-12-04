<script lang="ts">
  import "@repo/ui/globals.css";
  import "../app.css";

  import type { Snippet } from "svelte";

  import Navbar from "$lib/components/Navbar.svelte";

  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<Navbar session={data.session} />

{@render children()}
