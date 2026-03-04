<script>
  import OverlayRecordingBadge from '$lib/components/overlays/show/OverlayRecordingBadge.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayRecordingBadge {serverUrl} />
