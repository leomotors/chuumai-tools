<script lang="ts">
  import { ArrowLeftRight, Gauge, LogOut, Menu } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import { MediaQuery } from "svelte/reactivity";

  import { Button } from "@repo/ui/atom/button";
  import * as Popover from "@repo/ui/atom/popover";
  import * as Tooltip from "@repo/ui/atom/tooltip";
  import Discord from "@repo/ui/icons/Discord.svelte";
  import { signInAgreementNotice } from "@repo/ui/utils";

  let userOpen = $state(false);
  let mobileOpen = $state(false);
  // Tailwind's `md` breakpoint is 768px.
  const isMobile = new MediaQuery("(max-width: 767px)");

  type Props = {
    title: string;
    navigationLinks: Snippet;
    user?:
      | {
          id?: string | null;
          name?: string | null;
          image?: string | null;
        }
      | undefined;
    signIn: () => void;
    signOut: () => void;
    swapUrl?: string;
    swapTooltip?: string;
    /** Current page path; when it changes, any open menu is closed. */
    currentPath?: string;
  };

  let {
    title,
    navigationLinks,
    user,
    signIn,
    signOut,
    swapUrl,
    swapTooltip,
    currentPath,
  }: Props = $props();

  // Close menus after a navigation. Navigation links come from an
  // app-provided snippet and nested popovers render in a portal, so a click
  // handler on the menu content cannot catch them all.
  $effect(() => {
    if (currentPath !== undefined) {
      mobileOpen = false;
      userOpen = false;
    }
  });
</script>

<nav
  class="mx-4 mt-4 max-w-3xl rounded-full border border-gray-200/50 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xs md:mx-auto"
>
  <div class="flex items-center justify-between gap-6">
    <div class="flex flex-1 items-center gap-2">
      <a
        href="/"
        class="text-lg font-bold text-gray-800 transition-colors hover:text-pink-600"
      >
        {title}
      </a>
      {#if swapUrl}
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <a
                  href={swapUrl}
                  class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200/50 bg-white/50 text-gray-500 shadow-xs transition-all hover:scale-105 hover:bg-white/80 hover:text-pink-600 active:scale-95"
                  aria-label="Swap app"
                  {...props}
                >
                  <ArrowLeftRight class="size-4" />
                </a>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content
              class="rounded-lg border border-gray-200/50 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-md backdrop-blur-md"
              arrowClasses="bg-white fill-white"
            >
              {swapTooltip ?? "Swap application"}
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      {/if}
    </div>

    {#if isMobile.current}
      <Popover.Root bind:open={mobileOpen}>
        <Popover.Trigger
          class="flex size-9 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
          aria-label="Menu"
        >
          <Menu class="size-5" />
        </Popover.Trigger>
        <Popover.Content
          align="end"
          class="w-64 rounded-xl border border-gray-200/50 bg-white/70 p-3 shadow-lg backdrop-blur-md"
        >
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1 [&>a]:block [&>a]:py-1">
              {@render navigationLinks()}
            </div>
            <hr class="my-1 border-gray-200/50" />
            {#if user}
              <div class="flex items-center gap-2 px-1 py-1">
                {#if user.image}
                  <img
                    src={user.image}
                    alt={user.name ?? "User"}
                    class="size-8 rounded-full"
                  />
                {:else}
                  <div
                    class="flex size-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600"
                  >
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                {/if}
                <span class="truncate text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </div>
              <Button
                href="/dashboard"
                onclick={() => (mobileOpen = false)}
                variant="ghost"
                class="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <Gauge class="size-4" />
                Dashboard
              </Button>
              <Button
                onclick={() => {
                  mobileOpen = false;
                  signOut();
                }}
                variant="ghost"
                class="w-full justify-start gap-2 border-red-300 text-red-600 hover:border hover:bg-red-50 hover:text-red-700"
              >
                <LogOut class="size-4" />
                Logout
              </Button>
            {:else}
              <Button
                onclick={() => {
                  mobileOpen = false;
                  signIn();
                }}
                class="w-full bg-[#5865f2] text-white hover:bg-[#4752c4]"
              >
                Sign in with
                <Discord class="size-5" />
              </Button>
            {/if}
          </div>
        </Popover.Content>
      </Popover.Root>
    {:else}
      <div class="flex items-center gap-4">
        {@render navigationLinks()}
      </div>

      {#if user}
        <Popover.Root bind:open={userOpen}>
          <Popover.Trigger
            class="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-3 transition-colors hover:bg-gray-200"
          >
            {#if user.image}
              <img
                src={user.image}
                alt={user.name ?? "User"}
                class="size-8 rounded-full"
              />
            {:else}
              <div
                class="flex size-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600"
              >
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            {/if}
            <span class="text-sm font-medium text-gray-700">
              {user.name}
            </span>
          </Popover.Trigger>
          <Popover.Content
            class="w-64 rounded-xl border border-gray-200/50 bg-white/50 p-4 shadow-lg backdrop-blur-md"
          >
            <div class="space-y-3">
              <div class="space-y-1">
                <p class="text-xs text-gray-500">User ID</p>
                <p class="truncate text-sm font-medium text-gray-700">
                  {user.id ?? "N/A"}
                </p>
              </div>
              <hr class="border-gray-200/50" />
              <Button
                href="/dashboard"
                onclick={() => (userOpen = false)}
                variant="ghost"
                class="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <Gauge class="size-4" />
                Dashboard
              </Button>
              <Button
                onclick={() => {
                  userOpen = false;
                  signOut();
                }}
                variant="ghost"
                class="w-full justify-start gap-2 border-red-300 text-red-600 hover:border hover:bg-red-50 hover:text-red-700"
              >
                <LogOut class="size-4" />
                Logout
              </Button>
            </div>
          </Popover.Content>
        </Popover.Root>
      {:else}
        <Popover.Root>
          <Popover.Trigger
            class="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#5865f2] px-4 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-[#4752c4]"
          >
            Sign In
          </Popover.Trigger>
          <Popover.Content
            class="w-72 rounded-xl border border-gray-200/50 bg-white/70 p-4 shadow-lg backdrop-blur-md"
          >
            <div class="space-y-4">
              <Button
                onclick={signIn}
                class="w-full bg-[#5865f2] text-white hover:bg-[#4752c4]"
              >
                Sign in with
                <Discord class="size-5" />
              </Button>
              <p class="text-center text-xs text-gray-500">
                {signInAgreementNotice}
              </p>
            </div>
          </Popover.Content>
        </Popover.Root>
      {/if}
    {/if}
  </div>
</nav>
