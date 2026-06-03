<script lang="ts">
  import {
    Copy,
    Download,
    Eye,
    FileText,
    ImageOff,
    LoaderCircle,
    OctagonAlert,
    X,
  } from "@lucide/svelte";

  import AnimatedDialog from "$lib/components/dashboard/AnimatedDialog.svelte";
  import ZoomableImage from "$lib/components/dashboard/ZoomableImage.svelte";

  import { Button } from "@repo/ui/atom/button";
  import * as Table from "@repo/ui/atom/table";
  import { cn } from "@repo/ui/utils";

  import type { PageData } from "./$types";

  type Job = PageData["jobs"][number];

  let { data }: { data: PageData } = $props();

  let selectedJob = $state<Job | null>(null);
  let logJob = $state<Job | null>(null);
  let previewOpen = $state(false);
  let logOpen = $state(false);
  let copyFeedback = $state(false);

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

  function hasLogContent(job: Job) {
    return Boolean(job.jobError || job.jobLog);
  }

  function fullLogText(job: Job) {
    const sections: string[] = [];
    if (job.jobError) sections.push(`=== Error ===\n${job.jobError}`);
    if (job.jobLog) sections.push(`=== Log ===\n${job.jobLog}`);
    return sections.join("\n\n");
  }

  function logDialogTitle(job: Job) {
    if (job.jobError && job.jobLog) return "Error & log";
    if (job.jobError) return "Error";
    return "Log";
  }

  function openPreview(job: Job) {
    selectedJob = job;
    previewOpen = true;
  }

  function closePreview() {
    previewOpen = false;
  }

  function openLog(job: Job) {
    logJob = job;
    copyFeedback = false;
    logOpen = true;
  }

  function closeLog() {
    logOpen = false;
  }

  async function copyLog() {
    if (!logJob) return;
    await navigator.clipboard.writeText(fullLogText(logJob));
    copyFeedback = true;
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
          <Table.Head class="w-28">Duration</Table.Head>
          <Table.Head class="w-28">Status</Table.Head>
          <Table.Head class="w-28">Log</Table.Head>
          <Table.Head class="w-20 text-right">Image</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.jobs as job (job.id)}
          {@const status = jobStatus(job)}
          <Table.Row>
            <Table.Cell class="font-mono text-xs text-gray-700">
              #{job.id}
              {#if job.isFromOldVersion}
                <div class="mt-0.5 text-[10px] font-medium text-amber-600">
                  Old scraper
                </div>
              {/if}
            </Table.Cell>
            <Table.Cell class="text-xs text-gray-600">
              {formatDate(job.jobStart)}
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
            <Table.Cell>
              {#if hasLogContent(job)}
                <Button
                  size="sm"
                  variant={job.jobError ? "outline" : "ghost"}
                  class={cn(
                    "h-7 gap-1 px-2 text-xs",
                    job.jobError &&
                      "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800",
                  )}
                  onclick={() => openLog(job)}
                >
                  <FileText class="size-3.5" />
                  {job.jobError ? "View error" : "View log"}
                </Button>
              {:else if !job.jobEnd}
                <span class="text-xs text-gray-400">Running…</span>
              {:else}
                <span class="text-xs text-gray-400">—</span>
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

<AnimatedDialog
  open={previewOpen}
  onRequestClose={closePreview}
  onClosed={() => (selectedJob = null)}
  class="m-auto w-[min(96vw,calc(70vh*16/9+2rem))] rounded-xl border border-gray-200 bg-white p-0 shadow-2xl"
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
    <div class="p-4">
      <ZoomableImage
        src={imageUrl(selectedJob.id)}
        alt="Rating breakdown for job {selectedJob.id}"
      />
    </div>
  {/if}
</AnimatedDialog>

<AnimatedDialog
  open={logOpen}
  onRequestClose={closeLog}
  onClosed={() => {
    logJob = null;
    copyFeedback = false;
  }}
  class="m-auto w-[min(94vw,42rem)] rounded-xl border border-gray-200 bg-white p-0 shadow-2xl"
>
  {#if logJob}
    <div
      class="flex items-center justify-between border-b border-gray-100 px-4 py-3"
    >
      <div>
        <h2 class="text-sm font-semibold text-gray-900">
          Job {logDialogTitle(logJob)}
        </h2>
        <p class="mt-0.5 text-xs text-gray-500">Job #{logJob.id}</p>
      </div>
      <div class="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          class="h-8 gap-1.5 px-2 text-xs"
          onclick={copyLog}
        >
          <Copy class="size-3.5" />
          {copyFeedback ? "Copied" : "Copy"}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Close log"
          title="Close"
          onclick={closeLog}
        >
          <X class="size-4" />
        </Button>
      </div>
    </div>
    <div class="max-h-[70vh] overflow-auto p-4">
      <pre
        class="whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800">{fullLogText(
          logJob,
        )}</pre>
    </div>
  {/if}
</AnimatedDialog>
