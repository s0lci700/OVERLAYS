<script>
  import OverlayTurnOrder from '$lib/components/overlays/OverlayTurnOrder.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayTurnOrder {serverUrl} />
