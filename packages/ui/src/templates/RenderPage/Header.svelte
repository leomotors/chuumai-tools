<script lang="ts">
  import { ExtLink } from "@repo/ui/molecule/ExtLink";

  type Props = {
    title: string;
    webVersion: string;
    projectPath: string;
  };

  let { title, webVersion, projectPath }: Props = $props();
</script>

<div class="text-center mb-8">
  <h1 class="font-bold text-4xl mb-4 text-gray-800">
    {title}
  </h1>

  <article class="space-y-2 text-gray-600">
    <p>
      GitHub: <ExtLink href="https://github.com/leomotors/chuumai-tools">
        leomotors/chuumai-tools
      </ExtLink>
    </p>
    <p>
      Web Version: {webVersion} (<ExtLink
        href="https://github.com/leomotors/chuumai-tools/blob/main/{projectPath}/CHANGELOG.md"
      >
        Changelog
      </ExtLink>)
    </p>
  </article>
</div>
