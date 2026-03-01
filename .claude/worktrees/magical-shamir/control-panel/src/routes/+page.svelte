<!--
  Root index route: redirect users to the control panel characters page.
-->
<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    goto("/control/characters");
  });
</script>
