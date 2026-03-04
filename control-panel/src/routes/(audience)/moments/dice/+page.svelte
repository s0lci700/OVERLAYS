<script>
  import OverlayDice from '$lib/components/overlays/OverlayDice.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayDice {serverUrl} />
