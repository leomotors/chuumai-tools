<script lang="ts">
  import { toPng } from "html-to-image";

  import { page } from "$app/state";
  import Render from "$lib/components/Render.svelte";
  import { getVersionNameMapping } from "$lib/constants";
  import { getDefaultVersion, getEnabledVersions } from "$lib/version";

  import { handleDownload as handleDownloadBase } from "@repo/core/web";
  import {
    type ImgGenInput,
    imgGenInputSchema,
    type RawImageGen,
  } from "@repo/types/maimai";
  import Header from "@repo/ui/templates/RenderPage/Header.svelte";
  import InputSection from "@repo/ui/templates/RenderPage/InputSection.svelte";
  import StatusMessage from "@repo/ui/templates/RenderPage/StatusMessage.svelte";

  let files = $state<FileList>();

  const enabledVersions = getEnabledVersions();
  let selectedVersion = $state<string>(getDefaultVersion());

  let userData = $state<ImgGenInput>();
  let userError = $state<string>();
  let renderData = $state<RawImageGen>();
  let dataError = $state<string>();

  async function parseFile(fileList: FileList) {
    const file = fileList[0];

    const content = await file.text();
    const json = JSON.parse(content);
    const parseResult = imgGenInputSchema.safeParse(json);

    if (parseResult.success) {
      userData = parseResult.data;
      userError = undefined;
      getRatingData(userData);
    } else {
      userData = undefined;
      userError = parseResult.error.message;
    }
  }

  $effect(() => {
    if (files && files.length > 0) {
      parseFile(files);
    }
  });

  async function getRatingData(userData: ImgGenInput) {
    const res = await fetch("/api/calcRating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: userData,
        version: selectedVersion,
      }),
    });

    if (!res.ok) {
      console.error("Error fetching rating data:", res.statusText);
      dataError = `${res.statusText} ${await res.text()}`;
      return;
    }

    renderData = await res.json();
  }

  const handleDownload = () =>
    handleDownloadBase("chart", toPng, !!page.url.searchParams.get("debug"));
</script>

<div class="w-full max-w-4xl">
  <Header
    title="maimai Rating Image Generator"
    webVersion={WEB_VERSION}
    projectPath="apps/maimai-web"
  />

  <!-- Input Section -->
  <InputSection
    docsHash="maimai"
    bind:selectedVersion
    {enabledVersions}
    {getVersionNameMapping}
    bind:files
  />

  <!-- Status Messages -->
  <StatusMessage
    {userError}
    playerName={userData?.profile.playerName}
    lastPlayed={userData?.profile.lastPlayed}
    {dataError}
    calculatedRating={renderData?.rating.total}
    onReload={() => {
      renderData = undefined;
      if (userData) getRatingData(userData);
    }}
    {handleDownload}
  />

  <!-- Render Component -->
  {#if renderData}
    <div class="mt-8">
      <Render input={renderData} version={selectedVersion} />
    </div>
  {/if}
</div>
