<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setContext } from "svelte";

  import { cn } from "@repo/ui/utils";

  export type ChartConfig = Record<
    string,
    {
      label?: string;
      icon?: Snippet;
    } & (
      | { color?: string; theme?: never }
      | { color?: never; theme: Record<"light" | "dark", string> }
    )
  >;

  interface Props extends HTMLAttributes<HTMLDivElement> {
    config: ChartConfig;
    children: Snippet;
  }

  let { config, children, class: className, ...restProps }: Props = $props();

  // Set context for child components - wrap in $effect to handle reactivity
  $effect(() => {
    setContext("chart-config", config);
  });

  // Generate CSS variables for colors
  const colorVars = $derived.by(() => {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(config)) {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }
      if (value.theme) {
        // Use light theme as default, dark mode handled via CSS
        vars[`--color-${key}`] = value.theme.light;
      }
    }
    return vars;
  });
</script>

<div
  data-slot="chart"
  data-chart
  class={cn(
    "flex aspect-video justify-center text-xs [&_.layerchart-tooltip]:bg-background! [&_.layerchart-tooltip]:border-border! [&_.layerchart-tooltip-content]:text-foreground",
    className,
  )}
  style={Object.entries(colorVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}
  {...restProps}
>
  {@render children()}
</div>
