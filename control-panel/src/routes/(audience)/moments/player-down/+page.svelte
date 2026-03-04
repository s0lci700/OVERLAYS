<script>
  import OverlayPlayerDown from '$lib/components/overlays/moments/OverlayPlayerDown.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayPlayerDown {serverUrl} />
