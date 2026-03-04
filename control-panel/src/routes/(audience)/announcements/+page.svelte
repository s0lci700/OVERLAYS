<script>
  import OverlayAnnounce from '$lib/components/overlays/announcements/OverlayAnnounce.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayAnnounce {serverUrl} />
