<script lang="ts">
  import { LoaderCircle, Search } from "@lucide/svelte";

  import type { MusicDataViewSchema } from "$lib/functions/musicData";
  import { getDefaultVersion, getEnabledVersions } from "$lib/version";

  import { constantFromLevel } from "@repo/core/maimai";
  import { Button } from "@repo/ui/atom/button";
  import { Checkbox } from "@repo/ui/atom/checkbox";
  import { Label } from "@repo/ui/atom/label";
  import * as Select from "@repo/ui/atom/select";
  import * as Table from "@repo/ui/atom/table";
  import { SortableHeader } from "@repo/ui/molecule/sortable-header";

  import ChartLevelCell from "./ChartLevelCell.svelte";

  let { data } = $props();

  let selectedVersion = $state<string>("");
  let searchQuery = $state<string>("");
  let debouncedSearchQuery = $state<string>("");
  let sortField = $state<keyof MusicDataViewSchema>("releasedVersion");
  let sortDirection = $state<"asc" | "desc">("desc");
  let currentPage = $state<number>(1);
  let filterNullConstant = $state<boolean>(false);

  let musicData = $state<MusicDataViewSchema[]>([]);
  let loading = $state<boolean>(false);
  let error = $state<string>("");

  const pageSize = 50;
  const enabledVersions = getEnabledVersions();
  const isLoggedIn = $derived(!!data.session?.user?.id);

  $effect(() => {
    if (enabledVersions.length > 0 && !selectedVersion) {
      selectedVersion = getDefaultVersion();
    }
  });

  // Fetch data when version changes
  $effect(() => {
    if (selectedVersion) {
      fetchMusicData();
    }
  });

  async function fetchMusicData() {
    loading = true;
    error = "";
    try {
      const response = await fetch(`/api/musicData?version=${selectedVersion}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      musicData = await response.json();

      currentPage = 1; // Reset to first page
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
      musicData = [];
    } finally {
      loading = false;
    }
  }

  // Debounce search query
  let debounceTimeout: NodeJS.Timeout;
  let debouncePending = $state<boolean>(false);
  function handleInputChange() {
    debouncePending = true;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      debouncedSearchQuery = searchQuery;
      currentPage = 1; // Reset to first page on new search
      debouncePending = false;
    }, 300);
  }

  // Client-side filtering and sorting
  let filteredAndSortedData = $derived.by(() => {
    let result = [...musicData];

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.artist.toLowerCase().includes(query),
      );
    }

    // Filter null constants
    if (filterNullConstant) {
      result = result.filter(
        (item) =>
          item.basic?.constant == null ||
          item.advanced?.constant == null ||
          item.expert?.constant == null ||
          item.master?.constant == null ||
          (item.remaster && item.remaster.constant == null),
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: unknown;
      let bVal: unknown;

      // Handle difficulty columns
      if (
        sortField === "basic" ||
        sortField === "advanced" ||
        sortField === "expert" ||
        sortField === "master" ||
        sortField === "remaster"
      ) {
        const aChart = a[sortField];
        const bChart = b[sortField];

        if (!aChart && !bChart) return 0;
        if (!aChart) return 1;
        if (!bChart) return -1;

        aVal = aChart.constant ?? constantFromLevel(aChart.level);
        bVal = bChart.constant ?? constantFromLevel(bChart.level);
      } else {
        aVal = a[sortField as keyof MusicDataViewSchema];
        bVal = b[sortField as keyof MusicDataViewSchema];

        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
      }

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  });

  // Pagination
  let paginatedData = $derived.by(() => {
    const data = filteredAndSortedData;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  });

  let totalPages = $derived(Math.ceil(filteredAndSortedData.length / pageSize));

  function handleSort(
    field:
      | keyof MusicDataViewSchema
      | "basic"
      | "advanced"
      | "expert"
      | "master"
      | "remaster",
  ) {
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "desc";
    }
  }
</script>

<div class="min-h-screen pt-24 bg-gray-100">
  <div class="container mx-auto max-w-7xl px-4 pb-8">
    <!-- Header with glass effect -->
    <div
      class="mb-6 rounded-xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md"
    >
      <h1 class="mb-4 text-3xl font-bold text-gray-900">Music Data</h1>

      <!-- Controls -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end">
        <!-- Version Selector -->
        <div class="flex-1">
          <label
            for="version"
            class="mb-2 block text-sm font-medium text-gray-900"
          >
            Game Version
          </label>
          <Select.Root type="single" bind:value={selectedVersion}>
            <Select.Trigger class="w-full bg-white/90 backdrop-blur-sm">
              {selectedVersion || "Select version"}
            </Select.Trigger>
            <Select.Content class="bg-white/95 backdrop-blur-md">
              {#each enabledVersions as version (version)}
                <Select.Item value={version}>
                  {version}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <!-- Search -->
        <div class="flex-1">
          <label
            for="search"
            class="mb-2 block text-sm font-medium text-gray-900"
          >
            Search
          </label>
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-900 z-10"
            />
            <input
              id="search"
              type="text"
              bind:value={searchQuery}
              oninput={handleInputChange}
              placeholder="Search by title, artist, or ID..."
              class="w-full rounded-md border border-white/20 bg-white/90 py-2 pl-10 pr-4 {debouncePending
                ? 'pr-10'
                : ''} backdrop-blur-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            {#if debouncePending}
              <LoaderCircle
                class="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-900 z-10 animate-spin"
              />
            {/if}
          </div>
        </div>
      </div>

      <!-- Null Filter -->
      <div class="mt-4 flex items-center gap-3">
        <Checkbox
          id="null-filter"
          class="bg-white"
          bind:checked={filterNullConstant}
        />
        <Label for="null-filter">Show songs with missing constant data</Label>
      </div>

      <!-- Stats -->
      <div class="mt-4 text-sm text-gray-700">
        {#if !loading && musicData.length > 0}
          <p>
            Showing {paginatedData.length} of {filteredAndSortedData.length} songs
            {#if debouncedSearchQuery.trim() || filterNullConstant}
              (filtered from {musicData.length} total)
            {/if}
          </p>
        {:else}
          <p>Showing 0 of 0 songs</p>
        {/if}
        <p>"-" means no data</p>
      </div>
    </div>

    <!-- Table with glass effect -->
    {#if loading}
      <div
        class="flex items-center justify-center rounded-xl border border-white/20 bg-white/70 p-12 backdrop-blur-md"
      >
        <div class="text-lg text-black">Loading...</div>
      </div>
    {:else if error}
      <div
        class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-md"
      >
        <div class="text-lg text-red-200">Error: {error}</div>
      </div>
    {:else if musicData.length === 0}
      <div
        class="flex items-center justify-center rounded-xl border border-white/20 bg-white/70 p-12 backdrop-blur-md"
      >
        <div class="text-lg text-black">No data available</div>
      </div>
    {:else}
      <div
        class="rounded-xl border border-white/20 bg-white/70 backdrop-blur-md"
      >
        <div class="overflow-x-auto">
          <Table.Root>
            <Table.Header>
              <Table.Row class="border-white/20 hover:bg-white/5">
                <Table.Head
                  class="cursor-pointer text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("releasedVersion")}
                >
                  <SortableHeader
                    isSorting={sortField === "releasedVersion"}
                    {sortDirection}
                  >
                    Released
                  </SortableHeader>
                </Table.Head>
                <Table.Head class="text-gray-900 hover:text-gray-700">
                  Image
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("title")}
                >
                  <SortableHeader
                    isSorting={sortField === "title"}
                    {sortDirection}
                  >
                    Title
                  </SortableHeader>
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("artist")}
                >
                  <SortableHeader
                    isSorting={sortField === "artist"}
                    {sortDirection}
                  >
                    Artist
                  </SortableHeader>
                </Table.Head>
                <Table.Head class="text-center text-gray-900">
                  Chart Type
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-center text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("basic")}
                >
                  <SortableHeader
                    isSorting={sortField === "basic"}
                    {sortDirection}
                    align="center"
                  >
                    BAS
                  </SortableHeader>
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-center text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("advanced")}
                >
                  <SortableHeader
                    isSorting={sortField === "advanced"}
                    {sortDirection}
                    align="center"
                  >
                    ADV
                  </SortableHeader>
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-center text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("expert")}
                >
                  <SortableHeader
                    isSorting={sortField === "expert"}
                    {sortDirection}
                    align="center"
                  >
                    EXP
                  </SortableHeader>
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-center text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("master")}
                >
                  <SortableHeader
                    isSorting={sortField === "master"}
                    {sortDirection}
                    align="center"
                  >
                    MAS
                  </SortableHeader>
                </Table.Head>
                <Table.Head
                  class="cursor-pointer text-center text-gray-900 hover:text-gray-700"
                  onclick={() => handleSort("remaster")}
                >
                  <SortableHeader
                    isSorting={sortField === "remaster"}
                    {sortDirection}
                    align="center"
                  >
                    Re:MAS
                  </SortableHeader>
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each paginatedData as song (song.title + song.chartType)}
                <Table.Row class="border-white/20">
                  <Table.Cell class="font-medium text-gray-900">
                    {song.releasedVersion}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={song.image
                        ? `/api/imageProxy?img=${song.image}`
                        : "/placeholder.svg"}
                      alt="Jacket"
                      class="w-14 h-14 min-w-14 sm:w-20 sm:h-20 sm:min-w-20"
                    />
                  </Table.Cell>
                  <Table.Cell class="max-w-xs whitespace-normal text-gray-900">
                    {#if isLoggedIn}
                      <a
                        href="/dashboard/musicRecord/{song.title}"
                        class="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {song.title}
                      </a>
                    {:else}
                      {song.title}
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="max-w-xs whitespace-normal text-gray-900">
                    {song.artist}
                  </Table.Cell>
                  <Table.Cell class="font-medium text-gray-900 text-center">
                    <img
                      src="/charttype/{song.chartType}.png"
                      alt={song.chartType}
                      class="w-16 mx-auto"
                    />
                  </Table.Cell>
                  <Table.Cell class="text-gray-700 bg-green-500/20">
                    {#if song.basic}
                      <ChartLevelCell {...song.basic} difficulty="basic" />
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-gray-700 bg-orange-500/20">
                    {#if song.advanced}
                      <ChartLevelCell
                        {...song.advanced}
                        difficulty="advanced"
                      />
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-gray-700 bg-red-500/20">
                    {#if song.expert}
                      <ChartLevelCell {...song.expert} difficulty="expert" />
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-gray-700 bg-purple-500/20">
                    {#if song.master}
                      <ChartLevelCell {...song.master} difficulty="master" />
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-gray-700 bg-black/20">
                    {#if song.remaster}
                      <ChartLevelCell
                        {...song.remaster}
                        difficulty="remaster"
                      />
                    {/if}
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between border-t border-white/20 px-6 py-4"
        >
          <div class="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div class="flex gap-2">
            {#if totalPages > 1}
              <Button
                variant="outline"
                size="sm"
                onclick={() => (currentPage = 1)}
                disabled={currentPage === 1}
                class="bg-white/90 backdrop-blur-sm disabled:opacity-50"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => currentPage--}
                disabled={currentPage === 1}
                class="bg-white/90 backdrop-blur-sm disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => currentPage++}
                disabled={currentPage === totalPages}
                class="bg-white/90 backdrop-blur-sm disabled:opacity-50"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => (currentPage = totalPages)}
                disabled={currentPage === totalPages}
                class="bg-white/90 backdrop-blur-sm disabled:opacity-50"
              >
                Last
              </Button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
