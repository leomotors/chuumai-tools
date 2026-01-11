<script lang="ts">
  import type { chartLevelSchema } from "$lib/functions/musicData";

  import { constantFromLevel } from "@repo/core/maimai";
  import type { StdChartDifficulty } from "@repo/types/maimai";
  import { z } from "@repo/types/zod";
  import { cn } from "@repo/ui/utils";

  type Props = z.infer<typeof chartLevelSchema> & {
    difficulty: StdChartDifficulty;
  };

  let { level, constant, difficulty }: Props = $props();
  let mayHasConstant = $derived(
    difficulty !== "basic" || constantFromLevel(level) >= 7.5,
  );
</script>

<div class="flex flex-col gap-1 items-center">
  <p class={cn(mayHasConstant ? "text-lg" : "text-xl")}>{level}</p>

  {#if mayHasConstant}
    <p>{constant?.toFixed(1) ?? "-"}</p>
  {/if}
</div>
