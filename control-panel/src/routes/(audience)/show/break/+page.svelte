<script>
  import OverlayBreak from '$lib/components/overlays/show/OverlayBreak.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayBreak {serverUrl} />
