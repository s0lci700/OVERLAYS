<!--
  Root index route: redirect to Stage › Live › Characters.
-->
<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    goto("/live/characters");
  });
</script>
