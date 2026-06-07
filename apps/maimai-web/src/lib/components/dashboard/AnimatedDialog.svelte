<script lang="ts">
  import type { Snippet } from "svelte";

  import { cn } from "@repo/ui/utils";

  type Props = {
    open: boolean;
    onRequestClose: () => void;
    onClosed?: () => void;
    class?: string;
    children: Snippet;
  };

  let {
    open,
    onRequestClose,
    onClosed,
    class: className,
    children,
  }: Props = $props();

  let dialogEl = $state<HTMLDialogElement | null>(null);
  let presented = $state(false);

  const DURATION_MS = 220;

  $effect(() => {
    const el = dialogEl;
    if (!el) return;

    if (open) {
      if (!el.open) el.showModal();
      const frame = requestAnimationFrame(() => {
        presented = true;
      });
      return () => cancelAnimationFrame(frame);
    }

    presented = false;
    if (!el.open) return;

    const timeout = setTimeout(() => {
      el.close();
      onClosed?.();
    }, DURATION_MS);

    return () => clearTimeout(timeout);
  });

  function onBackdropClick(event: MouseEvent) {
    if (event.target === dialogEl) onRequestClose();
  }

  function onCancel(event: Event) {
    event.preventDefault();
    onRequestClose();
  }

  function onNativeClose() {
    presented = false;
  }
</script>

<dialog
  bind:this={dialogEl}
  class={cn("animated-dialog", presented && "animated-dialog--open", className)}
  onclick={onBackdropClick}
  oncancel={onCancel}
  onclose={onNativeClose}
>
  {@render children()}
</dialog>

<style>
  .animated-dialog {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
    transition:
      opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .animated-dialog--open {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .animated-dialog::backdrop {
    background: rgb(0 0 0 / 55%);
    opacity: 0;
    transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .animated-dialog--open::backdrop {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .animated-dialog,
    .animated-dialog::backdrop {
      transition-duration: 0.01ms;
    }
  }
</style>
