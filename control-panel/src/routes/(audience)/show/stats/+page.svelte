<script>
  import OverlayStats from '$lib/components/overlays/show/OverlayStats.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayStats {serverUrl} />
