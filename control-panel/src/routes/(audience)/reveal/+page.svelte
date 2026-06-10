<script>
	import OverlayReveal from '$lib/components/overlays/reveal/OverlayReveal.svelte';
	import { getContext } from 'svelte';
	const ctx = getContext('serverUrl');
	let serverUrl = $derived(ctx?.get() ?? 'http://localhost:3000');
</script>

<OverlayReveal {serverUrl} />
