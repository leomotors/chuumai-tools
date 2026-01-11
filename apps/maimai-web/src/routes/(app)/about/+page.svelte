<script lang="ts">
  import { ExtLink } from "@repo/ui/molecule/ExtLink";
  import AboutPage from "@repo/ui/templates/AboutPage.svelte";
</script>

<AboutPage
  appProjectPath="apps/maimai-web"
  webVersion={WEB_VERSION}
  gameName="maimai"
>
  {#snippet credits()}
    <p>Inspired by mimi xd bot</p>
  {/snippet}
  {#snippet infoSource()}
    <p>
      Music Information (such as title, artist, level, jacket image) from
      Official Chunithm (JP) Website
    </p>
    <p>
      Chart Constant from https://reiwa.f5.si (Primary Source) and manual
      <ExtLink href="https://www.youtube.com/watch?v=LLjfal8jCYI">
        override
      </ExtLink> sometimes by using data from <ExtLink
        href="https://gamerch.com/maimai"
      >
        maimai wiki
      </ExtLink>.
    </p>
  {/snippet}
  <!-- {#snippet contentAfter()}
    <div class="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-4">
      <h3 class="font-bold text-lg">Miscellaneous</h3>
      <ul class="list-disc list-inside">
        <li>
          <a href="/ui-playground" class="text-blue-500 hover:text-blue-600">
            UI Playground
          </a>
        </li>
      </ul>
    </div>
  {/snippet} -->
</AboutPage>
