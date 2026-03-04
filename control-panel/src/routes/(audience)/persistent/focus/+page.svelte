<script>
  import OverlayCharacterFocus from '$lib/components/overlays/OverlayCharacterFocus.svelte';
  import { getContext } from 'svelte';
  const ctx = getContext('serverUrl');
  let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>
<OverlayCharacterFocus {serverUrl} />
