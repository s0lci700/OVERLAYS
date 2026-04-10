<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { getPortraitUrl } from '$lib/services/pocketbase';
	import CharacterSheet from '$lib/components/cast/players/CharacterSheet.svelte';
	import { characters } from '$lib/services/socket.svelte';

	let { data }: { data: PageData } = $props();
	const character = $derived($characters.find(
		(c) => c.id === data.character.id) ?? data.character);


	const portraitUrl = $derived(character ? getPortraitUrl(character) : null);
	onMount(() => {
		console.debug('[PlayerSheet] Mounted with data:', data);
	});
</script>

<CharacterSheet {character} {portraitUrl} />
