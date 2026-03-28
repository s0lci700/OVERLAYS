<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { getPortraitUrl } from '$lib/services/pocketbase';
	import CharacterSheet from '$lib/components/cast/players/CharacterSheet.svelte';

	onMount(() => {
		console.log('[PlayerSheet] Mounted with data:', data);
	});

	let { data }: { data: PageData } = $props();
	const character = $derived(data.character);
	const portraitUrl = $derived(character ? getPortraitUrl(character) : null);
</script>

<CharacterSheet {character} {portraitUrl} />
