<script lang="ts">
  import { RotateCcw, ZoomIn, ZoomOut } from "@lucide/svelte";

  import { Button } from "@repo/ui/atom/button";
  import { cn } from "@repo/ui/utils";

  type Props = {
    src: string;
    alt: string;
  };

  let { src, alt }: Props = $props();

  let viewport: HTMLDivElement | undefined = $state();
  let image: HTMLImageElement | undefined = $state();

  let ready = $state(false);
  let aspectRatio = $state("16 / 9");

  let scale = $state(1);
  let translateX = $state(0);
  let translateY = $state(0);
  let minScale = $state(0.1);
  let maxScale = $state(6);
  let fitScale = $state(1);

  let dragging = $state(false);
  let lastPointerX = 0;
  let lastPointerY = 0;

  const ZOOM_STEP = 1.2;

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  function resetFit() {
    const img = image;
    const vp = viewport;
    if (!img?.naturalWidth || !img.naturalHeight || !vp) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;

    if (vw <= 0 || vh <= 0) return;

    aspectRatio = `${iw} / ${ih}`;
    fitScale = Math.min(vw / iw, vh / ih);
    minScale = fitScale;
    maxScale = Math.max(4, fitScale * 6);
    scale = fitScale;
    translateX = (vw - iw * scale) / 2;
    translateY = (vh - ih * scale) / 2;
    ready = true;
  }

  function isAtMinZoom() {
    return scale <= minScale + 1e-4;
  }

  function zoomAround(clientX: number, clientY: number, factor: number) {
    const vp = viewport;
    if (!vp) return;

    if (factor < 1 && isAtMinZoom()) return;

    const rect = vp.getBoundingClientRect();
    const focalX = clientX - rect.left;
    const focalY = clientY - rect.top;
    const imageX = (focalX - translateX) / scale;
    const imageY = (focalY - translateY) / scale;
    const nextScale = clamp(scale * factor, minScale, maxScale);

    if (nextScale === scale) return;

    translateX = focalX - imageX * nextScale;
    translateY = focalY - imageY * nextScale;
    scale = nextScale;
  }

  function onImageLoad() {
    ready = false;
    requestAnimationFrame(() => resetFit());
  }

  function onWheel(event: WheelEvent) {
    if (!ready) return;
    const zoomingOut = event.deltaY > 0;
    if (zoomingOut && isAtMinZoom()) return;
    event.preventDefault();
    const factor = zoomingOut ? 1 / ZOOM_STEP : ZOOM_STEP;
    zoomAround(event.clientX, event.clientY, factor);
  }

  function onPointerDown(event: PointerEvent) {
    if (!ready || event.button !== 0) return;
    dragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    viewport?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging) return;
    translateX += event.clientX - lastPointerX;
    translateY += event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
  }

  function onPointerUp(event: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    viewport?.releasePointerCapture(event.pointerId);
  }

  function zoomIn() {
    const vp = viewport;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    zoomAround(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      ZOOM_STEP,
    );
  }

  function zoomOut() {
    const vp = viewport;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    zoomAround(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      1 / ZOOM_STEP,
    );
  }

  $effect(() => {
    const vp = viewport;
    if (!vp) return;

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      if (!image?.naturalWidth) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => resetFit(), 80);
    });
    observer.observe(vp);

    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  });

  $effect(() => {
    if (src) ready = false;
  });

  const viewportClass = $derived(
    cn(
      "relative mx-auto min-h-48 w-full max-h-[70vh] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 touch-none select-none",
      ready && (dragging ? "cursor-grabbing" : "cursor-grab"),
    ),
  );
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-end gap-1">
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="Zoom out"
      title="Zoom out"
      onclick={zoomOut}
      disabled={!ready || isAtMinZoom()}
    >
      <ZoomOut class="size-4" />
    </Button>
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="Zoom in"
      title="Zoom in"
      onclick={zoomIn}
      disabled={!ready}
    >
      <ZoomIn class="size-4" />
    </Button>
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="Reset zoom"
      title="Reset zoom"
      onclick={resetFit}
      disabled={!ready}
    >
      <RotateCcw class="size-4" />
    </Button>
  </div>

  <div
    bind:this={viewport}
    role="application"
    aria-label={alt}
    class={viewportClass}
    style:aspect-ratio={aspectRatio}
    onwheel={onWheel}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    ondblclick={resetFit}
  >
    {#if !ready}
      <div
        class="absolute inset-0 flex items-center justify-center text-xs text-gray-400"
      >
        Loading…
      </div>
    {/if}
    <div
      class="absolute top-0 left-0 origin-top-left"
      style:transform="translate({translateX}px, {translateY}px) scale({scale})"
    >
      <img
        bind:this={image}
        {src}
        {alt}
        class="block max-w-none"
        draggable="false"
        onload={onImageLoad}
      />
    </div>
  </div>

  <p class="text-center text-[11px] text-gray-500">
    Scroll to zoom · drag to pan · double-click to fit
  </p>
</div>
