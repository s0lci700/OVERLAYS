<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>DADOS & RISAS — Handbook</title>
</svelte:head>

{@render children()}
