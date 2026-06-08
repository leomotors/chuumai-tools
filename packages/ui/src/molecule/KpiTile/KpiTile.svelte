<script lang="ts" module>
  export type KpiTileProps = {
    label: string;
    value: string | number;
    delta?: string;
    deltaSuffix?: string;
    deltaPositive?: boolean;
    color: string;
    primary?: boolean;
    sparklineValues?: number[];
    badgeLabel?: string;
    badgeValue?: string | number;
  };
</script>

<script lang="ts">
  import { Sparkline } from "../Sparkline/index.js";

  let {
    label,
    value,
    delta,
    deltaSuffix = "this month",
    deltaPositive = true,
    color,
    primary = false,
    sparklineValues = [],
    badgeLabel,
    badgeValue,
  }: KpiTileProps = $props();

  const cardStyle = $derived(
    primary
      ? `background: linear-gradient(180deg, color-mix(in oklch, ${color} 8%, #ffffff), #ffffff); border-color: color-mix(in oklch, ${color} 22%, rgba(0,0,0,0.08));`
      : "",
  );
</script>

<div
  class="relative overflow-hidden rounded-xl border border-gray-200/70 bg-white px-4 pt-3.5 pb-2 shadow-sm"
  style={cardStyle}
>
  <div class="flex items-center gap-1.5">
    <span
      class="size-2 rounded-full"
      style:background-color={color}
      aria-hidden="true"
    ></span>
    <span
      class="text-[11px] font-semibold uppercase tracking-wider text-gray-500"
    >
      {label}
    </span>
  </div>
  {#if badgeValue !== undefined}
    <span
      class="absolute top-3.5 right-4 inline-flex items-baseline gap-1 text-xs font-semibold text-gray-700"
    >
      {#if badgeLabel}
        <span class="text-[10px] uppercase text-gray-400">{badgeLabel}</span>
      {/if}
      {badgeValue}
    </span>
  {/if}
  <div class="mt-1.5 flex min-w-0 items-baseline">
    <span class="text-3xl font-bold leading-none tracking-tight text-gray-900">
      {value}
    </span>
  </div>
  {#if delta}
    <div
      class="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold"
      class:text-emerald-600={deltaPositive}
      class:text-rose-600={!deltaPositive}
    >
      {#if deltaPositive}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 2 L8 7 L2 7 Z" fill="currentColor" />
        </svg>
      {:else}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 8 L8 3 L2 3 Z" fill="currentColor" />
        </svg>
      {/if}
      {delta}
      <span class="font-medium text-gray-400">{deltaSuffix}</span>
    </div>
  {/if}
  {#if sparklineValues.length > 0}
    <div class="mt-2 h-7">
      <Sparkline values={sparklineValues} {color} height={28} />
    </div>
  {/if}
</div>
