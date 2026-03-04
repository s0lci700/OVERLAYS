<script>
  import OverlayConditions from '$lib/components/overlays/OverlayConditions.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayConditions {serverUrl} />
