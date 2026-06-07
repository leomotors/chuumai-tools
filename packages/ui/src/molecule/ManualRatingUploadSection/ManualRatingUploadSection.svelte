<script lang="ts">
  import {
    AlertTriangle,
    CheckCircle2,
    Database,
    FileSpreadsheet,
    Upload,
  } from "@lucide/svelte";
  import { onMount } from "svelte";

  type TimeZoneMode = "utc" | "local";

  type PreviewRecord = {
    timestamp: string;
    localTimestamp: string;
    rating: number;
    sourceRow: number;
    timeValue: string;
    ratingValue: string;
  };

  type RejectedRow = {
    sourceRow: number;
    reason: string;
  };

  type UploadState =
    | {
        status: "preview";
        fileName: string;
        recordsJson: string;
        preview: {
          hasHeader: boolean;
          timeColumn: { label: string; index: number };
          ratingColumn: { label: string; index: number };
          records: PreviewRecord[];
          rejectedRows: RejectedRow[];
          totalRows: number;
          dataRows: number;
          warnings: string[];
          timeZoneMode: TimeZoneMode;
          localTimeZone: string;
        };
      }
    | {
        status: "inserted";
        insertedCount: number;
      }
    | {
        status: "error";
        message: string;
      };

  interface Props {
    state?: UploadState;
    ratingLabel: string;
    ratingDescription: string;
    previewAction?: string;
    insertAction?: string;
    formatRating?: (rating: number) => string;
  }

  let {
    state: uploadState,
    ratingLabel,
    ratingDescription,
    previewAction = "?/previewManualRatingUpload",
    insertAction = "?/insertManualRatingUpload",
    formatRating = (rating) => rating.toLocaleString(),
  }: Props = $props();

  let localTimeZone = $state("UTC");

  onMount(() => {
    localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  });

  const selectedTimeZoneMode = $derived(
    uploadState?.status === "preview"
      ? uploadState.preview.timeZoneMode
      : "local",
  );
  const previewRows = $derived(
    uploadState?.status === "preview"
      ? uploadState.preview.records.slice(0, 10)
      : [],
  );
  const rejectedRows = $derived(
    uploadState?.status === "preview"
      ? uploadState.preview.rejectedRows.slice(0, 5)
      : [],
  );
  const previewTimeZoneLabel = $derived(
    uploadState?.status === "preview"
      ? uploadState.preview.timeZoneMode === "local"
        ? `Local (${uploadState.preview.localTimeZone})`
        : "UTC"
      : "",
  );
</script>

<section
  class="rounded-xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm"
>
  <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
    <div>
      <div class="flex items-center gap-2">
        <FileSpreadsheet class="size-4 text-gray-700" />
        <h2 class="text-sm font-semibold text-gray-900">
          Manual Upload Rating
        </h2>
      </div>
      <p class="mt-1 text-xs text-gray-500">{ratingDescription}</p>
    </div>

    {#if uploadState?.status === "inserted"}
      <div
        class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
      >
        <CheckCircle2 class="size-3.5" />
        Inserted {uploadState.insertedCount.toLocaleString()} rows
      </div>
    {/if}
  </div>

  <form
    method="POST"
    enctype="multipart/form-data"
    action={previewAction}
    class="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3"
  >
    <input type="hidden" name="localTimeZone" value={localTimeZone} />

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label for="manual-rating-csv" class="sr-only">Rating CSV</label>
      <input
        id="manual-rating-csv"
        name="ratingCsv"
        type="file"
        accept=".csv,text/csv,text/plain"
        required
        class="min-w-0 flex-1 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-gray-700"
      />
      <button
        type="submit"
        class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
      >
        <Upload class="size-3.5" />
        Preview CSV
      </button>
    </div>

    <fieldset
      class="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600"
    >
      <legend class="px-1 font-medium text-gray-900">
        Interpret timezone-less times as
      </legend>
      <div class="mt-1 flex flex-wrap gap-3">
        <label class="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name="timeZoneMode"
            value="local"
            checked={selectedTimeZoneMode === "local"}
            class="size-3.5"
          />
          Local ({localTimeZone})
        </label>
        <label class="inline-flex items-center gap-1.5">
          <input
            type="radio"
            name="timeZoneMode"
            value="utc"
            checked={selectedTimeZoneMode === "utc"}
            class="size-3.5"
          />
          UTC
        </label>
      </div>
      <p class="mt-1 text-gray-500">
        Explicit offsets like Z or +07:00 are honored. Preview times are shown
        in local time with UTC offset.
      </p>
    </fieldset>
  </form>

  {#if uploadState?.status === "error"}
    <div
      class="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
    >
      <AlertTriangle class="mt-0.5 size-3.5 shrink-0" />
      <span>{uploadState.message}</span>
    </div>
  {/if}

  {#if uploadState?.status === "preview"}
    <div class="mt-4 space-y-4">
      <div
        class="grid gap-2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 sm:grid-cols-5"
      >
        <div>
          <div class="font-medium text-gray-900">File</div>
          <div class="truncate">{uploadState.fileName}</div>
        </div>
        <div>
          <div class="font-medium text-gray-900">Rows</div>
          <div>
            {uploadState.preview.records.length.toLocaleString()} accepted / {uploadState.preview.dataRows.toLocaleString()}
            data
          </div>
        </div>
        <div>
          <div class="font-medium text-gray-900">Time Column</div>
          <div>{uploadState.preview.timeColumn.label}</div>
        </div>
        <div>
          <div class="font-medium text-gray-900">{ratingLabel} Column</div>
          <div>{uploadState.preview.ratingColumn.label}</div>
        </div>
        <div>
          <div class="font-medium text-gray-900">Time Zone</div>
          <div>{previewTimeZoneLabel}</div>
        </div>
      </div>

      {#if uploadState.preview.warnings.length > 0}
        <div
          class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          <AlertTriangle class="mt-0.5 size-3.5 shrink-0" />
          <span>{uploadState.preview.warnings.join(" ")}</span>
        </div>
      {/if}

      <div class="overflow-hidden rounded-lg border border-gray-200">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-left text-xs">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="px-3 py-2 font-medium">Source Row</th>
                <th class="px-3 py-2 font-medium">Time</th>
                <th class="px-3 py-2 font-medium">{ratingLabel}</th>
                <th class="px-3 py-2 font-medium">
                  Local Preview ({uploadState.preview.localTimeZone})
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white text-gray-700">
              {#each previewRows as record (record.sourceRow)}
                <tr>
                  <td class="px-3 py-2 font-mono text-gray-500">
                    {record.sourceRow}
                  </td>
                  <td class="px-3 py-2">{record.timeValue}</td>
                  <td class="px-3 py-2 font-medium text-gray-900">
                    {formatRating(record.rating)}
                  </td>
                  <td class="px-3 py-2">{record.localTimestamp}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      {#if uploadState.preview.records.length > previewRows.length}
        <p class="text-xs text-gray-500">
          Showing first {previewRows.length.toLocaleString()} rows. All {uploadState.preview.records.length.toLocaleString()}
          accepted rows will be inserted.
        </p>
      {/if}

      {#if rejectedRows.length > 0}
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <div class="mb-1 text-xs font-medium text-gray-900">
            Skipped Row Samples
          </div>
          <ul class="space-y-1 text-xs text-gray-500">
            {#each rejectedRows as row (row.sourceRow)}
              <li>Row {row.sourceRow}: {row.reason}</li>
            {/each}
          </ul>
        </div>
      {/if}

      <form method="POST" action={insertAction} class="flex justify-end">
        <input type="hidden" name="records" value={uploadState.recordsJson} />
        <button
          type="submit"
          class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <Database class="size-3.5" />
          Insert {uploadState.preview.records.length.toLocaleString()} Rows
        </button>
      </form>
    </div>
  {/if}
</section>
