<!--
  Root index route: redirect to Stage › Live › Characters.
-->
<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { resolve } from "$app/paths";
  const liveCharacters = resolve("/live/characters");

  onMount(() => {
    goto(liveCharacters);
  });
</script>
