<!--
  Dice route — TASK-2.2: physical dice intake.
  Mounts DiceIntakeForm (records what was rolled at the table — never simulates)
  plus a recent-rolls history (last 10, filterable by character).
-->
<script lang="ts">
	import DiceIntakeForm from '$lib/components/stage/main-panel/DiceIntakeForm.svelte';
	import { characters, lastRoll } from '$lib/services/socket.svelte';

	interface RollEntry {
		id: string;
		charId: string;
		characterName: string;
		result: number;
		modifier: number;
		rollResult: number;
		sides: number;
	}

	const HISTORY_LIMIT = 10;

	let recentRolls = $state<RollEntry[]>([]);
	let filterCharId = $state('all');

	// Accumulate broadcasts into a local history — the socket store only keeps the last roll.
	$effect(() => {
		const roll = $lastRoll as RollEntry | null;
		if (!roll?.id || recentRolls[0]?.id === roll.id) return;
		recentRolls.unshift(roll);
		if (recentRolls.length > HISTORY_LIMIT) recentRolls.pop();
	});

	const visibleRolls = $derived(
		filterCharId === 'all' ? recentRolls : recentRolls.filter((r) => r.charId === filterCharId)
	);
</script>

<section class="dice-route">
	<div class="dice-route__form">
		<DiceIntakeForm />
	</div>

	<aside class="dice-route__history">
		<header class="dice-route__history-header">
			<h2 class="label-caps">TIRADAS RECIENTES</h2>
			<select
				class="dice-route__filter"
				bind:value={filterCharId}
				aria-label="Filtrar por personaje"
			>
				<option value="all">TODOS</option>
				{#each $characters as char (char.id)}
					<option value={char.id}>{char.name}</option>
				{/each}
			</select>
		</header>

		{#if visibleRolls.length === 0}
			<p class="dice-route__empty">Sin tiradas registradas en esta sesión.</p>
		{:else}
			<ul class="dice-route__list">
				{#each visibleRolls as roll (roll.id)}
					<li class="roll-row">
						<span class="roll-row__die">D{roll.sides}</span>
						<span class="roll-row__char">{roll.characterName}</span>
						<span class="roll-row__detail">
							{roll.result}{roll.modifier >= 0 ? '+' : ''}{roll.modifier}
						</span>
						<span class="roll-row__total">{roll.rollResult}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>
</section>

<style>
	.dice-route {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--black);
		min-height: calc(100dvh - 64px);
	}

	@media (max-width: 900px) {
		.dice-route {
			grid-template-columns: 1fr;
		}
	}

	.dice-route__form,
	.dice-route__history {
		background: var(--black-card);
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		min-width: 0;
	}

	.dice-route__history {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		align-self: start;
	}

	.dice-route__history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.dice-route__filter {
		background: var(--black);
		border: 1px solid var(--grey-dim);
		border-radius: var(--radius-sm);
		color: var(--white);
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: var(--space-1) var(--space-2);
	}

	.dice-route__empty {
		font-family: var(--font-ui);
		font-size: 13px;
		color: var(--grey);
	}

	.dice-route__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.roll-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) 0;
		border-bottom: 1px solid var(--grey-dim);
		font-family: var(--font-ui);
		font-size: 13px;
	}

	.roll-row:last-child {
		border-bottom: none;
	}

	.roll-row__die {
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		color: var(--cyan);
		flex-shrink: 0;
		width: 32px;
	}

	.roll-row__char {
		color: var(--white);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.roll-row__detail {
		color: var(--grey);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.roll-row__total {
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--cast-amber);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
		width: 32px;
		text-align: right;
	}
</style>
