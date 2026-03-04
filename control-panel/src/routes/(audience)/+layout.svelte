<!--
  Audience layout — OBS / vMix Browser Source shell.

  Strips all app chrome (no header, no sidebar, no nav).
  Full 1920×1080 canvas with transparent background.
  Reads ?server= query param and passes it to overlay components via context.

  OBS Browser Source settings:
  - Width: 1920  Height: 1080
  - Allow transparency: ON (check "Allow transparency" in OBS)
  - Shutdown source when not visible: OFF
  - Refresh browser when scene becomes active: ON
-->
<script>
  import { page } from "$app/stores";
  import { setContext } from "svelte";

  let { children } = $props();

  // Read ?server= and expose to child overlay components via context.
  const serverUrl = $derived(
    $page.url.searchParams.get("server") || "http://localhost:3000"
  );

  setContext("serverUrl", { get: () => serverUrl });
</script>

<div class="audience-canvas">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: hidden;
  }

  .audience-canvas {
    width: 1920px;
    height: 1080px;
    position: relative;
    overflow: hidden;
    background: transparent;
  }
</style>
