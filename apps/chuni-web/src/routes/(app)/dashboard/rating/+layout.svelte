<script lang="ts">
  import { Activity, ListMusic, Target, Trophy } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { page } from "$app/state";

  import { cn } from "@repo/ui/utils";

  let { children }: { children: Snippet } = $props();

  const tabs = [
    { href: "/dashboard/rating", label: "Composition", icon: ListMusic },
    { href: "/dashboard/rating/analysis", label: "Daily", icon: Activity },
    {
      href: "/dashboard/rating/analysis?view=timeline",
      label: "Timeline",
      icon: Trophy,
    },
    { href: "/dashboard/rating/milestones", label: "Milestones", icon: Target },
  ];

  const activeHref = $derived.by(() => {
    const path = page.url.pathname;
    if (path.startsWith("/dashboard/rating/milestones")) {
      return "/dashboard/rating/milestones";
    }
    if (path.startsWith("/dashboard/rating/analysis")) {
      return page.url.searchParams.get("view") === "timeline"
        ? "/dashboard/rating/analysis?view=timeline"
        : "/dashboard/rating/analysis";
    }
    return "/dashboard/rating";
  });
</script>

<div class="space-y-4">
  <nav
    class="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 text-gray-500"
    aria-label="Rating views"
  >
    {#each tabs as tab (tab.href)}
      {@const Icon = tab.icon}
      {@const active = tab.href === activeHref}
      <a
        href={tab.href}
        aria-current={active ? "page" : undefined}
        class={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
          active ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900",
        )}
      >
        <Icon class="size-4" />
        {tab.label}
      </a>
    {/each}
  </nav>

  {@render children()}
</div>
