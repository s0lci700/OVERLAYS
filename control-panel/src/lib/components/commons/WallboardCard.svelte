<!--
  WallboardCard
  =============
  TV-readable, read-only character status card for the Commons wallboard.
  Big name + thick HP bar + condition pills — legible from across the room.
-->
<script lang="ts">
	import './WallboardCard.css';
	import ConditionPill from '$lib/components/shared/condition-pill/condition-pill.svelte';
	import { resolvePhotoSrc } from '$lib/services/utils.js';
	import { SERVER_URL } from '$lib/services/socket.svelte';
	import { HP_THRESHOLDS } from '$lib/contracts';
	import type { CharacterRecord } from '$lib/contracts';

	let { character }: { character: CharacterRecord } = $props();

	const hpPct = $derived(
		character.hp_max > 0
			? Math.max(0, Math.min(100, (character.hp_current / character.hp_max) * 100))
			: 0
	);

	const tier = $derived(
		hpPct > HP_THRESHOLDS.HEALTHY
			? 'healthy'
			: hpPct > HP_THRESHOLDS.INJURED
				? 'injured'
				: 'critical'
	);

	const photo = $derived(
		character.portrait ? resolvePhotoSrc(character.portrait, SERVER_URL) : null
	);
</script>

<article class="wallboard-card" class:is-critical={tier === 'critical'}>
	<div class="wallboard-card__head">
		{#if photo}
			<img class="wallboard-card__portrait" src={photo} alt={character.name} />
		{/if}
		<div class="wallboard-card__identity">
			<h2 class="wallboard-card__name">{character.name}</h2>
			<span class="wallboard-card__class">
				{character.class_name ?? ''}{character.level ? ` · NV ${character.level}` : ''}
			</span>
		</div>
		<span class="wallboard-card__hp-numbers">
			{character.hp_current}<span class="wallboard-card__hp-max">/{character.hp_max}</span>
		</span>
	</div>

	<div
		class="wallboard-card__bar"
		role="meter"
		aria-valuemin={0}
		aria-valuemax={character.hp_max}
		aria-valuenow={character.hp_current}
		aria-label="Puntos de vida de {character.name}"
	>
		<div class="wallboard-card__fill" data-tier={tier} style="width: {hpPct}%"></div>
	</div>

	<div class="wallboard-card__conditions">
		{#each character.conditions ?? [] as condition (condition.id)}
			<ConditionPill label={condition.condition_name} />
		{/each}
	</div>
</article>
