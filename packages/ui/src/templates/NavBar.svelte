<script lang="ts">
  import { Gauge, LogOut } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  import { Button } from "@repo/ui/atom/button";
  import * as Popover from "@repo/ui/atom/popover";
  import Discord from "@repo/ui/icons/Discord.svelte";

  let userOpen = $state(false);

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
  };

  let { title, navigationLinks, user, signIn, signOut }: Props = $props();
</script>

<nav
  class="mx-auto mt-4 max-w-3xl rounded-full border border-gray-200/50 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xs"
>
  <div class="flex items-center justify-between gap-6">
    <a
      href="/"
      class="flex-1 text-lg font-bold text-gray-800 transition-colors hover:text-pink-600"
    >
      {title}
    </a>

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
              By signing in, you agree to our terms of service and privacy
              policy (See about page)
            </p>
          </div>
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
</nav>
