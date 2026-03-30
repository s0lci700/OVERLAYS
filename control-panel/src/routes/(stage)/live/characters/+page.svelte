<!--
  Characters tab: renders one CharacterCard per character in the store.
-->
<script lang="ts">
	import CharacterCard from '$lib/components/stage/character-card/CharacterCard.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { CharacterRecord } from '$lib/components/cast/players/CharacterSheet.stories.svelte';
	// import { characters } from "$lib/services/socket.svelte";
	let { data }: { data: PageData;} = $props();
	// console.log("Characters page data:", data.characters);
	let chars : CharacterRecord[] = $derived(data.characters);
	onMount(() => {
    console.log(chars);
    console.log(data.charCount);
    console.log("Characters in store on mount:", data.characters);
	});
</script>

<div>
	{#each chars as character}
		<CharacterCard {character} />
	{/each}
</div>
