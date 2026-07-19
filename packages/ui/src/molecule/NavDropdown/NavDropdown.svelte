<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";

  import * as Popover from "@repo/ui/atom/popover";

  let {
    label,
    links,
  }: {
    label: string;
    links: { href: string; label: string }[];
  } = $props();

  // Internal state so each rendered instance opens independently. NavBar
  // renders navigation links twice (mobile menu and desktop bar, toggled via
  // CSS breakpoints), and popover content escapes CSS hiding through its
  // portal — shared open state would surface the hidden instance's popover.
  let open = $state(false);
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
  >
    {label}
    <ChevronDown class="size-4" />
  </Popover.Trigger>
  <Popover.Content
    class="w-48 rounded-xl border border-gray-200/50 bg-white/70 p-2 shadow-lg backdrop-blur-md"
  >
    {#each links as link (link.href)}
      <a
        href={link.href}
        onclick={() => (open = false)}
        class="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {link.label}
      </a>
    {/each}
  </Popover.Content>
</Popover.Root>
