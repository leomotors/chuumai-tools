<script lang="ts">
  import { page } from "$app/state";

  import ErrorPage from "@repo/ui/templates/ErrorPage.svelte";
</script>

<ErrorPage status={page.status} message={page.error?.message} />
