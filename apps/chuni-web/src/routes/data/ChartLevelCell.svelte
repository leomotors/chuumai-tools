<script lang="ts">
  import type { chartLevelSchema } from "$lib/functions/musicData";
  import { cn } from "@repo/ui/utils";
  import { constantFromLevel } from "@repo/utils/chuni";
  import { z } from "@repo/utils/zod";

  interface Props extends z.infer<typeof chartLevelSchema> {}

  let { level, constant }: Props = $props();
  let mayHasConstant = $derived(constantFromLevel(level) >= 10);
</script>

<div class="flex flex-col gap-1 items-center">
  <p class={cn(mayHasConstant ? "text-lg" : "text-xl")}>{level}</p>

  {#if mayHasConstant}
    <p>{constant?.toFixed(1) ?? "-"}</p>
  {/if}
</div>
