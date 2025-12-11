<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import { signIn, signOut } from "@auth/sveltekit/client";
  import { ChevronDown, Gauge, LogOut } from "@lucide/svelte";

  import { Button } from "@repo/ui/atom/button";
  import * as Popover from "@repo/ui/atom/popover";
  import Discord from "@repo/ui/icons/Discord.svelte";

  let { session }: { session: Session | null } = $props();
</script>

<nav
  class="mx-auto mt-4 max-w-3xl rounded-full border border-gray-200/50 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xs"
>
  <div class="flex items-center justify-between gap-6">
    <a
      href="/"
      class="flex-1 text-lg font-bold text-gray-800 transition-colors hover:text-pink-600"
    >
      Uni
    </a>

    <div class="flex items-center gap-4">
      <Popover.Root>
        <Popover.Trigger
          class="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-pink-600"
        >
          Tools
          <ChevronDown class="size-4" />
        </Popover.Trigger>
        <Popover.Content
          class="w-48 rounded-xl border border-gray-200/50 bg-white/70 p-2 shadow-lg backdrop-blur-md"
        >
          <a
            href="/tools/preview-next"
            class="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Preview Next
          </a>
          <a
            href="/tools/chart-constant"
            class="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Chart Constant
          </a>
        </Popover.Content>
      </Popover.Root>

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
    </div>

    {#if session?.user}
      <Popover.Root>
        <Popover.Trigger
          class="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-3 transition-colors hover:bg-gray-200"
        >
          {#if session.user.image}
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              class="size-8 rounded-full"
            />
          {:else}
            <div
              class="flex size-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600"
            >
              {session.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          {/if}
          <span class="text-sm font-medium text-gray-700">
            {session.user.name}
          </span>
        </Popover.Trigger>
        <Popover.Content
          class="w-64 rounded-xl border border-gray-200/50 bg-white/50 p-4 shadow-lg backdrop-blur-md"
        >
          <div class="space-y-3">
            <div class="space-y-1">
              <p class="text-xs text-gray-500">User ID</p>
              <p class="truncate text-sm font-medium text-gray-700">
                {session.user.id ?? "N/A"}
              </p>
            </div>
            <hr class="border-gray-200/50" />
            <Button
              href="/dashboard"
              variant="ghost"
              class="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Gauge class="size-4" />
              Dashboard
            </Button>
            <Button
              onclick={() => signOut()}
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
              onclick={() => signIn("discord")}
              class="w-full bg-[#5865f2] text-white hover:bg-[#4752c4]"
            >
              Sign in with
              <Discord class="size-5" />
            </Button>
            <p class="text-center text-xs text-gray-500">
              When you sign in, only your Discord user ID is stored in the
              database.
            </p>
          </div>
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
</nav>
