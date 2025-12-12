<script lang="ts">
  import type { Snippet } from "svelte";
  import { getContext } from "svelte";

  import { cn } from "@repo/ui/utils";

  import type { ChartConfig } from "./chart-container.svelte";

  type IndicatorType = "line" | "dot" | "dashed";

  interface TooltipPayloadItem {
    key: string;
    value: number | string;
    name?: string;
    color?: string;
  }

  interface Props {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: IndicatorType;
    nameKey?: string;
    labelKey?: string;
    label?: string;
    labelFormatter?: (value: string | number) => string;
    formatter?: Snippet<[{ payload: TooltipPayloadItem; config: ChartConfig }]>;
    payload?: TooltipPayloadItem[];
    class?: string;
  }

  let {
    hideLabel = false,
    hideIndicator = false,
    indicator = "dot",
    nameKey,
    labelKey,
    label,
    labelFormatter,
    formatter,
    payload = [],
    class: className,
  }: Props = $props();

  const config = getContext<ChartConfig>("chart-config");

  function getItemConfig(key: string) {
    return config?.[key] ?? {};
  }

  function getLabel(item: TooltipPayloadItem) {
    if (labelKey) {
      const itemConfig = getItemConfig(labelKey);
      return itemConfig.label ?? labelKey;
    }
    if (label) return label;
    return item.name ?? item.key;
  }

  function getName(item: TooltipPayloadItem) {
    if (nameKey) {
      const itemConfig = getItemConfig(item.key);
      return itemConfig.label ?? item.key;
    }
    const itemConfig = getItemConfig(item.key);
    return itemConfig.label ?? item.name ?? item.key;
  }
</script>

{#if payload.length > 0}
  <div
    class={cn(
      "border-border bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
      className,
    )}
  >
    {#if !hideLabel}
      <div class="text-muted-foreground font-medium">
        {#if labelFormatter}
          {labelFormatter(getLabel(payload[0]))}
        {:else}
          {getLabel(payload[0])}
        {/if}
      </div>
    {/if}

    <div class="grid gap-1.5">
      {#each payload as item (item.key)}
        {@const itemConfig = getItemConfig(item.key)}
        {#if formatter}
          {@render formatter({ payload: item, config })}
        {:else}
          <div class="flex w-full flex-wrap items-stretch gap-2">
            {#if !hideIndicator}
              <div
                class={cn(
                  "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                  {
                    "h-2.5 w-2.5": indicator === "dot",
                    "w-1": indicator === "line",
                    "w-0 border-[1.5px] border-dashed bg-transparent":
                      indicator === "dashed",
                  },
                )}
                style="--color-bg: {itemConfig.color ??
                  item.color ??
                  'currentColor'}; --color-border: {itemConfig.color ??
                  item.color ??
                  'currentColor'}"
              ></div>
            {/if}
            <div
              class="flex flex-1 justify-between gap-2 leading-none [&>svg]:text-muted-foreground [&>svg]:size-3"
            >
              <span class="text-muted-foreground">{getName(item)}</span>
              <span class="text-foreground font-mono font-medium tabular-nums">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </span>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}
