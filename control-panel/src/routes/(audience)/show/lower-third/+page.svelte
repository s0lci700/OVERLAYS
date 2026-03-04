<script>
  import OverlayLowerThird from '$lib/components/overlays/show/OverlayLowerThird.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayLowerThird {serverUrl} />
