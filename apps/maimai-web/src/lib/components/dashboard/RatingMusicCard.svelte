<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import type {
    DashboardMaimaiChart,
    DashboardMaimaiHistoryChart,
  } from "$lib/functions/dashboardMusic";

  import { difficultyColorMap, getDXStar, getRank } from "@repo/core/maimai";
  import { ranks } from "@repo/types/maimai";

  type Music = DashboardMaimaiChart | DashboardMaimaiHistoryChart;

  interface Props {
    music: Music;
    index?: number;
    meta?: string;
  }

  let { music, index, meta }: Props = $props();

  const comboMark = $derived(
    music.comboMark === "NONE"
      ? undefined
      : music.comboMark?.toLowerCase().replace("+", "p"),
  );
  const syncMark = $derived(
    music.syncMark === "NONE"
      ? undefined
      : music.syncMark?.toLowerCase().replace("+", "p"),
  );
  const rankMark = $derived(
    (ranks[getRank(music.score)] || "D").toLowerCase().replace("+", "p"),
  );
  const dxStar = $derived(getDXStar(music.dxScore ?? 0, music.dxScoreMax ?? 0));
  const difficultyLabel = $derived(
    music.difficulty === "remaster"
      ? "Re:MASTER"
      : music.difficulty.toUpperCase(),
  );
  const difficultyClass = $derived(
    music.difficulty === "utage"
      ? "bg-pink-500 text-white"
      : difficultyColorMap[music.difficulty],
  );
  const levelLabel = $derived(
    music.level > 0
      ? music.levelSure
        ? music.level.toFixed(1)
        : `${music.level.toFixed(1)}?`
      : "?",
  );
  const recordAge = $derived.by(() => {
    if (!("achievedAt" in music) || !music.achievedAt) return null;

    const diff = Date.now() - new Date(music.achievedAt).getTime();
    if (diff < 0) return null;

    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const text =
      minutes < 60
        ? `${Math.max(1, minutes)}m ago`
        : hours < 24
          ? `${hours}h ago`
          : days < 30
            ? `${days}d ago`
            : new Date(music.achievedAt).toLocaleDateString();

    return {
      text,
      isRecent: diff <= 7 * 24 * 60 * 60 * 1000,
    };
  });
</script>

<a
  href="/data/{encodeURIComponent(music.title)}"
  class="group block rounded-lg border border-gray-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
>
  <div class="flex min-h-36 gap-3 p-3">
    <div
      class="relative size-24 shrink-0 overflow-hidden rounded-md bg-gray-100"
    >
      <img
        src={music.image
          ? `/api/imageProxy?img=${music.image}`
          : "/placeholder.svg"}
        alt={music.title}
        class="size-full object-cover"
      />
      <img
        src="/charttype/{music.chartType === 'std' || music.chartType === 'dx'
          ? music.chartType
          : 'dx'}.png"
        alt={music.chartType}
        class="absolute bottom-1 left-1 h-4"
      />
      {#if index !== undefined}
        <div
          class={twMerge(
            "absolute left-1 top-1 flex size-7 items-center justify-center rounded-full text-xs font-bold shadow-sm",
            "source" in music && music.source === "selection"
              ? "bg-amber-500 text-white"
              : "bg-white text-gray-950",
          )}
        >
          {index + 1}
        </div>
      {/if}
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex min-w-0 flex-wrap items-center gap-1">
            <div
              class={twMerge(
                "inline-flex max-w-full items-center rounded px-1.5 py-0.5 text-[11px] font-bold",
                difficultyClass,
              )}
            >
              {difficultyLabel}
            </div>
            {#if "source" in music && music.source === "selection"}
              <div
                class="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800"
              >
                Selection
              </div>
            {/if}
          </div>
          <h3
            class="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-950"
          >
            {music.title}
          </h3>
        </div>
        <div
          class="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-right font-rodin-b"
        >
          <div class="text-[10px] font-medium text-gray-500">LV</div>
          <div class="text-sm font-bold text-gray-950">{levelLabel}</div>
        </div>
      </div>

      <div class="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-3 text-xs">
        <div>
          <div class="text-[10px] font-medium text-gray-500">Score</div>
          <div class="font-semibold text-gray-900">
            {(music.score / 10000).toFixed(4)}%
          </div>
          {#if recordAge}
            <div
              class={twMerge(
                "mt-0.5 text-[10px] font-semibold",
                recordAge.isRecent ? "text-emerald-700" : "text-gray-500",
              )}
            >
              Achieved {recordAge.text}
            </div>
          {/if}
        </div>
        <div>
          <div class="text-[10px] font-medium text-gray-500">Rating</div>
          <div class="font-semibold text-gray-900">
            {music.rating === null ? "---" : music.rating}
          </div>
        </div>
      </div>

      <div class="mt-2 flex min-h-5 items-center gap-2">
        <img src="/rankmark/{rankMark}.png" alt="Rank" class="h-4" />
        <img
          src="/playmark/{comboMark || 'fc_dummy'}.png"
          alt={comboMark || "NONE"}
          class="h-4 w-auto"
        />
        <img
          src="/playmark/{syncMark || 'sync_dummy'}.png"
          alt={syncMark || "NONE"}
          class="h-4 w-auto"
        />
        {#if dxStar}
          <img src="/dxstar/{dxStar}.png" alt="DX Star" class="h-5 w-5" />
        {/if}
      </div>

      {#if meta}
        <div class="mt-2 truncate text-[11px] text-gray-500">{meta}</div>
      {/if}
    </div>
  </div>
</a>
