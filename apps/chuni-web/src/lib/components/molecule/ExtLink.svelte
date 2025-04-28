<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    href: string;
    children: Snippet;
  }

  let { href, children }: Props = $props();
</script>

<a
  class="text-blue-500 hover:underline"
  {href}
  target="_blank"
  rel="noreferrer"
>
  {@render children()}
</a>
