<!--
  Characters tab: renders one CharacterCard per character in the store.
-->
<script lang="ts">
	import CharacterCard from '$lib/components/stage/character-card/CharacterCard.svelte';
	import type { PageData } from './$types';
	import { characters } from '$lib/services/socket.svelte';

	let { data }: { data: PageData } = $props();

	// Use the reactive socket store for live updates; fall back to SSR snapshot until socket hydrates.
	let chars = $derived($characters.length > 0 ? $characters : data.characters);
</script>

<svelte:boundary>
	<div>
	{#if chars.length === 0}
		<p>No hay personajes cargados.</p>
	{:else}
		{#each chars as character (character.id)}
			<CharacterCard {character} />
		{/each}
	{/if}
	</div>

	{#snippet failed(error: unknown, reset: () => void)}
		<div class="boundary-fallback">
			<p class="label-caps">Failed to load characters</p>
			<p class="boundary-detail">{(error as Error)?.message ?? 'Error fetching characters'}</p>
			<button class="base" onclick={reset}>Retry</button>
		</div>
	{/snippet}
</svelte:boundary>
