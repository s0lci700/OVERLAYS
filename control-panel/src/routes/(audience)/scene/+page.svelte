<!--
  Audience › Scene Title Overlay
  Route: /scene?server=http://192.168.1.x:3000
  OBS Browser Source: 1920×1080, transparent background.
-->
<script>
  import OverlaySceneTitle from "$lib/components/overlays/OverlaySceneTitle.svelte";
  import { getContext } from "svelte";

  const ctx = getContext("serverUrl");
  let serverUrl = $derived(ctx?.get() ?? "http://localhost:3000");
</script>

<OverlaySceneTitle {serverUrl} />
