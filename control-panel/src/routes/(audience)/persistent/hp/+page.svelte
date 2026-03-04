<script>
  import OverlayHP from '$lib/components/overlays/OverlayHP.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayHP {serverUrl} />
