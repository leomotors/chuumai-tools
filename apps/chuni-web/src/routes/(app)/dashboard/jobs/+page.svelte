<script lang="ts">
  import {
    Download,
    Eye,
    ImageOff,
    LoaderCircle,
    OctagonAlert,
    X,
  } from "@lucide/svelte";

  import { Button } from "@repo/ui/atom/button";
  import * as Table from "@repo/ui/atom/table";
  import { cn } from "@repo/ui/utils";

  import type { PageData } from "./$types";

  type Job = PageData["jobs"][number];

  let { data }: { data: PageData } = $props();

  let selectedJob = $state<Job | null>(null);
  let previewDialog: HTMLDialogElement | null = null;

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function imageUrl(jobId: number) {
    return `/api/jobs/ratingBreakdownImage/file?jobId=${jobId}`;
  }

  function formatDate(value: string | null) {
    if (!value) return "-";
    return dateFormatter.format(new Date(value));
  }

  function formatDuration(job: Job) {
    if (!job.jobEnd) return "-";

    const start = new Date(job.jobStart).getTime();
    const end = new Date(job.jobEnd).getTime();
    const totalSeconds = Math.max(0, Math.round((end - start) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  function jobStatus(job: Job) {
    if (!job.jobEnd) return "running";
    if (job.jobError) return "failed";
    return "success";
  }

  function statusLabel(status: ReturnType<typeof jobStatus>) {
    switch (status) {
      case "failed":
        return "Failed";
      case "running":
        return "Running";
      case "success":
        return "Success";
    }
  }

  function statusClass(status: ReturnType<typeof jobStatus>) {
    switch (status) {
      case "failed":
        return "border-red-200 bg-red-50 text-red-700";
      case "running":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "success":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
  }

  function briefDetail(job: Job) {
    if (job.jobError) return job.jobError;
    if (job.jobLog) return job.jobLog;
    if (!job.jobEnd) return "Scrape job is still running.";
    return "Scrape finished without saved log details.";
  }

  function openPreview(job: Job) {
    selectedJob = job;
    previewDialog?.showModal();
  }

  function closePreview() {
    previewDialog?.close();
    selectedJob = null;
  }

  function closeOnBackdrop(event: MouseEvent) {
    if (event.target === previewDialog) {
      closePreview();
    }
  }
</script>

<section class="rounded-xl border border-gray-200/70 bg-white shadow-sm">
  <div
    class="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h2 class="text-sm font-semibold text-gray-900">Job List</h2>
      <p class="mt-1 text-xs text-gray-500">
        Recent scraper jobs and captured rating breakdown images.
      </p>
    </div>
    <p class="text-xs font-medium text-gray-500">
      {data.jobs.length.toLocaleString()} recent jobs
    </p>
  </div>

  {#if data.jobs.length > 0}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-20">Job</Table.Head>
          <Table.Head>Started</Table.Head>
          <Table.Head>Finished</Table.Head>
          <Table.Head class="w-28">Duration</Table.Head>
          <Table.Head class="w-28">Status</Table.Head>
          <Table.Head>Detail</Table.Head>
          <Table.Head class="w-20 text-right">Image</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.jobs as job (job.id)}
          {@const status = jobStatus(job)}
          <Table.Row>
            <Table.Cell class="font-mono text-xs text-gray-700">
              #{job.id}
            </Table.Cell>
            <Table.Cell class="text-xs text-gray-600">
              {formatDate(job.jobStart)}
            </Table.Cell>
            <Table.Cell class="text-xs text-gray-600">
              {formatDate(job.jobEnd)}
            </Table.Cell>
            <Table.Cell class="text-xs text-gray-600">
              {formatDuration(job)}
            </Table.Cell>
            <Table.Cell>
              <span
                class={cn(
                  "inline-flex h-6 items-center rounded-full border px-2 text-xs font-semibold",
                  statusClass(status),
                )}
              >
                {#if status === "failed"}
                  <OctagonAlert class="mr-1 size-3" />
                {:else if status === "running"}
                  <LoaderCircle class="mr-1 size-3" />
                {/if}
                {statusLabel(status)}
              </span>
            </Table.Cell>
            <Table.Cell class="max-w-[22rem]">
              <div
                class="truncate text-xs text-gray-600"
                title={briefDetail(job)}
              >
                {briefDetail(job)}
              </div>
              {#if job.isFromOldVersion}
                <div class="mt-1 text-[11px] font-medium text-amber-600">
                  Old scraper version
                </div>
              {/if}
            </Table.Cell>
            <Table.Cell class="text-right">
              {#if job.hasRatingBreakdownImage}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Preview rating breakdown image for job {job.id}"
                  title="Preview image"
                  onclick={() => openPreview(job)}
                >
                  <Eye class="size-4" />
                </Button>
              {:else}
                <span
                  class="inline-flex size-8 items-center justify-center text-gray-300"
                  title="No image"
                  aria-label="No rating breakdown image"
                >
                  <ImageOff class="size-4" />
                </span>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  {:else}
    <div class="px-5 py-8 text-center">
      <h2 class="text-sm font-semibold text-gray-900">No jobs yet</h2>
      <p class="mt-1 text-xs text-gray-500">
        Completed scrape jobs will appear here after your first upload.
      </p>
    </div>
  {/if}
</section>

<dialog
  bind:this={previewDialog}
  class="m-auto w-[min(94vw,56rem)] rounded-xl border border-gray-200 bg-white p-0 shadow-2xl backdrop:bg-black/60"
  onclick={closeOnBackdrop}
  onclose={() => (selectedJob = null)}
>
  {#if selectedJob}
    <div
      class="flex items-center justify-between border-b border-gray-100 px-4 py-3"
    >
      <div>
        <h2 class="text-sm font-semibold text-gray-900">
          Rating Breakdown Image
        </h2>
        <p class="mt-0.5 text-xs text-gray-500">Job #{selectedJob.id}</p>
      </div>
      <div class="flex items-center gap-1">
        <Button
          href={imageUrl(selectedJob.id)}
          download={`rating-breakdown-job-${selectedJob.id}.png`}
          size="icon-sm"
          variant="ghost"
          aria-label="Download rating breakdown image"
          title="Download"
        >
          <Download class="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Close preview"
          title="Close"
          onclick={closePreview}
        >
          <X class="size-4" />
        </Button>
      </div>
    </div>
    <div class="max-h-[78vh] overflow-auto bg-gray-50 p-3">
      <img
        src={imageUrl(selectedJob.id)}
        alt="Rating breakdown for job {selectedJob.id}"
        class="mx-auto h-auto max-w-full rounded-lg border border-gray-200 bg-white"
      />
    </div>
  {/if}
</dialog>
