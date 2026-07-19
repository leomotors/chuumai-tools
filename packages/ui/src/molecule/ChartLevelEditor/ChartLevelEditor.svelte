<script lang="ts">
  import type { Snippet } from "svelte";

  import { Button } from "@repo/ui/atom/button";
  import { Input } from "@repo/ui/atom/input";
  import { Label } from "@repo/ui/atom/label";
  import * as Popover from "@repo/ui/atom/popover";

  type SaveHandler = (value: {
    level: string;
    constant: string;
  }) => void | Promise<void>;

  let {
    level,
    constant,
    title,
    onsave,
    children,
  }: {
    /** Current level of the chart, used as the initial form value. */
    level: string;
    /** Current constant of the chart (null when unset). */
    constant: number | null;
    /** Optional heading shown above the form (e.g. song + difficulty). */
    title?: string;
    /**
     * Called when the admin saves. Receives the raw string inputs so the
     * caller can validate/parse with shared logic. Throw to surface an error
     * message inside the popover; the popover closes on a resolved save.
     */
    onsave: SaveHandler;
    /** The cell content that acts as the clickable trigger. */
    children: Snippet;
  } = $props();

  let open = $state(false);
  let levelInput = $state("");
  let constantInput = $state("");
  let saving = $state(false);
  let errorMessage = $state("");

  function handleOpenChange(next: boolean) {
    if (next) {
      // Reset the form to the current values every time it opens.
      levelInput = level;
      constantInput = constant === null ? "" : constant.toString();
      errorMessage = "";
    }
  }

  async function handleSave() {
    saving = true;
    errorMessage = "";

    try {
      await onsave({ level: levelInput, constant: constantInput });
      open = false;
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Failed to save";
    } finally {
      saving = false;
    }
  }
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange}>
  <Popover.Trigger
    class="flex w-full cursor-pointer justify-center rounded px-1 py-1 transition-colors hover:bg-black/10"
  >
    {@render children()}
  </Popover.Trigger>
  <Popover.Content class="w-64">
    <div class="flex flex-col gap-3">
      {#if title}
        <p class="text-sm font-semibold text-gray-900">{title}</p>
      {/if}

      <div class="flex flex-col gap-1.5">
        <Label for="chart-level-input">Level</Label>
        <Input
          id="chart-level-input"
          bind:value={levelInput}
          placeholder="e.g. 13+"
          autocomplete="off"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <Label for="chart-constant-input">Constant</Label>
        <Input
          id="chart-constant-input"
          bind:value={constantInput}
          type="number"
          step="0.1"
          placeholder="Leave blank for none"
          autocomplete="off"
        />
      </div>

      {#if errorMessage}
        <p class="text-sm text-red-600">{errorMessage}</p>
      {/if}

      <div class="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={saving}
          onclick={() => (open = false)}
        >
          Cancel
        </Button>
        <Button size="sm" disabled={saving} onclick={handleSave}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  </Popover.Content>
</Popover.Root>
