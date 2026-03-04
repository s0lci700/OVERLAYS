<script>
  import OverlayLevelUp from '$lib/components/overlays/moments/OverlayLevelUp.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayLevelUp {serverUrl} />
