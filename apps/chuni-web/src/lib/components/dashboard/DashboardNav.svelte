<script lang="ts">
  import { ChartLine, ClipboardList, Trophy } from "@lucide/svelte";

  import { page } from "$app/state";

  import { cn } from "@repo/ui/utils";

  const links = [
    { href: "/dashboard/activity", label: "Activity", icon: ChartLine },
    { href: "/dashboard/milestones", label: "Milestones", icon: Trophy },
    { href: "/dashboard/jobs", label: "Jobs", icon: ClipboardList },
  ];

  function isActive(href: string): boolean {
    return (
      page.url.pathname === href || page.url.pathname.startsWith(`${href}/`)
    );
  }
</script>

<nav
  class="flex w-full flex-wrap gap-1 rounded-xl border border-gray-200/70 bg-white p-1 shadow-sm"
  aria-label="Dashboard sections"
>
  {#each links as link (link.href)}
    {@const Icon = link.icon}
    {@const active = isActive(link.href)}
    <a
      href={link.href}
      aria-current={active ? "page" : undefined}
      class={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      <Icon class="size-4" />
      {link.label}
    </a>
  {/each}
</nav>
