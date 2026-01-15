<script lang="ts">
  import { ExtLink } from "@repo/ui/molecule/ExtLink";
  import AboutPage from "@repo/ui/templates/AboutPage.svelte";
</script>

<AboutPage
  appProjectPath="apps/chuni-web"
  webVersion={WEB_VERSION}
  gameName="Chunithm"
>
  {#snippet credits()}
    <p>
      Inspired by <ExtLink href="https://reiwa.f5.si">
        https://reiwa.f5.si
      </ExtLink>
    </p>
  {/snippet}
  {#snippet infoSource()}
    <p>
      Music Information (such as title, artist, level, jacket image) from
      Official Chunithm (JP) Website
    </p>
    <p>
      Chart Constant from <ExtLink href="https://arcade-songs.zetaraku.dev">
        https://arcade-songs.zetaraku.dev
      </ExtLink> (Old Main Source) + Google Sheet from
      <ExtLink href="https://x.com/CHUNITHM_wiki">Chunithm Wiki</ExtLink>
      +
      <ExtLink href="https://chuni-penguin.beerpsi.cc/developer/api/">
        beer-psi's website
      </ExtLink> (will be new main source) and manual
      <ExtLink href="https://www.youtube.com/watch?v=LLjfal8jCYI">
        override
      </ExtLink> sometimes.
    </p>
  {/snippet}
</AboutPage>
