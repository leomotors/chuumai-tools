<script lang="ts">
  import MyMilestones from "$lib/components/MyMilestones.svelte";

  let { data } = $props();
</script>

<MyMilestones milestones={data.myMilestones} />
