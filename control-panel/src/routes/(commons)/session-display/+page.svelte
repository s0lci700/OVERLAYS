<!--
  Session Display — Commons wallboard (Phase 3).
  Passive party-status mirror for the room: HP, conditions, last roll,
  and the currently revealed queue payload. Listen-only — never writes.
-->
<script lang="ts">
	import WallboardCard from '$lib/components/commons/WallboardCard.svelte';
	import MysticalEmptyState from '$lib/components/cast/shared/MysticalEmptyState.svelte';
	import { characters, lastRoll, subscribe, socketStatus } from '$lib/services/socket.svelte';
	import {
		QUEUE_PAYLOAD_PUBLISHED,
		QUEUE_PAYLOAD_CLEARED,
		type QueuePayloadPublishedPayload,
		type QueuePayloadClearedPayload
	} from '$lib/contracts/events';
	import type { QueueItem } from '$lib/contracts';
	import { fade, fly } from 'svelte/transition';

	// ─── Party totals ─────────────────────────────────────────────────────────

	const totalHpCur = $derived($characters.reduce((sum, c) => sum + (c.hp_current || 0), 0));
	const totalHpMax = $derived($characters.reduce((sum, c) => sum + (c.hp_max || 0), 0));
	const totalConditions = $derived(
		$characters.reduce((sum, c) => sum + (c.conditions?.length || 0), 0)
	);

	// ─── Active reveal payload (queue consumer) ───────────────────────────────

	let activeReveals = $state<QueueItem[]>([]);
	const currentReveal = $derived(activeReveals.at(-1) ?? null);

	$effect(() => {
		// Root layout connects the socket in onMount; retry quietly until ready.
		let unsubPublished: (() => void) | null = null;
		let unsubCleared: (() => void) | null = null;
		const wire = () => {
			try {
				unsubPublished = subscribe(
					QUEUE_PAYLOAD_PUBLISHED,
					(data: QueuePayloadPublishedPayload) => {
						if (!data.item?.id) return;
						activeReveals = [...activeReveals.filter((i) => i.id !== data.item.id), data.item];
					}
				);
				unsubCleared = subscribe(QUEUE_PAYLOAD_CLEARED, (data: QueuePayloadClearedPayload) => {
					activeReveals = activeReveals.filter((i) => i.id !== data.itemId);
				});
				return true;
			} catch {
				return false; // socket not initialized yet
			}
		};
		if (!wire()) {
			const retry = setInterval(() => {
				if (wire()) clearInterval(retry);
			}, 500);
			return () => {
				clearInterval(retry);
				unsubPublished?.();
				unsubCleared?.();
			};
		}
		return () => {
			unsubPublished?.();
			unsubCleared?.();
		};
	});

	const REVEAL_LABELS: Record<QueueItem['kind'], string> = {
		character_intro: 'PERSONAJE',
		info_block: 'INFORMACIÓN',
		location_update: 'LOCACIÓN'
	};
</script>

<section class="wallboard">
	<header class="wallboard__header">
		<div>
			<h1 class="wallboard__title">DADOS &amp; RISAS</h1>
			<span class="wallboard__subtitle">Estado del grupo · en vivo</span>
		</div>
		{#if $characters.length > 0}
			<div class="wallboard__totals">
				<div class="wallboard__total">
					<span class="wallboard__total-label">SALUD DEL GRUPO</span>
					<span class="wallboard__total-value"
						>{totalHpCur}<span class="wallboard__total-max">/{totalHpMax}</span></span
					>
				</div>
				<div class="wallboard__total">
					<span class="wallboard__total-label">CONDICIONES</span>
					<span class="wallboard__total-value">{totalConditions}</span>
				</div>
			</div>
		{/if}
	</header>

	<main class="wallboard__grid-area">
		{#if $characters.length === 0}
			<div class="wallboard__empty">
				<MysticalEmptyState
					title="ESPERANDO LA SESIÓN"
					message={socketStatus.connected
						? 'Conectado. Aún no hay personajes en la mesa.'
						: 'Conectando con la mesa de producción…'}
					icon="hourglass_empty"
				/>
			</div>
		{:else}
			<div class="wallboard__grid">
				{#each $characters as character (character.id)}
					<WallboardCard {character} />
				{/each}
			</div>
		{/if}
	</main>

	<footer class="wallboard__footer">
		{#if currentReveal}
			<div
				class="wallboard__reveal"
				data-kind={currentReveal.kind}
				in:fly={{ y: 16, duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				<span class="wallboard__reveal-kind">{REVEAL_LABELS[currentReveal.kind]}</span>
				<span class="wallboard__reveal-title">{currentReveal.title}</span>
			</div>
		{/if}
		{#if $lastRoll}
			<div class="wallboard__roll" aria-live="polite">
				<span class="wallboard__roll-die">D{$lastRoll.sides}</span>
				<span class="wallboard__roll-char">{$lastRoll.characterName ?? $lastRoll.charId}</span>
				<span class="wallboard__roll-total">{$lastRoll.rollResult}</span>
			</div>
		{/if}
	</footer>
</section>

<style>
	.wallboard {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-5);
		min-height: calc(100dvh - 64px);
	}

	.wallboard__header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
		border-bottom: 1px solid var(--grey-dim);
		padding-bottom: var(--space-3);
	}

	.wallboard__title {
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--white);
		margin: 0;
		line-height: 1;
	}

	.wallboard__subtitle {
		font-family: var(--font-ui);
		font-size: 13px;
		color: var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.wallboard__totals {
		display: flex;
		gap: var(--space-5);
	}

	.wallboard__total {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.wallboard__total-label {
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--grey);
	}

	.wallboard__total-value {
		font-family: var(--font-mono);
		font-size: 32px;
		font-weight: 700;
		color: var(--cast-amber, #c8944a);
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.wallboard__total-max {
		font-size: 18px;
		color: var(--grey);
	}

	.wallboard__grid-area {
		flex: 1;
	}

	.wallboard__empty {
		display: grid;
		place-items: center;
		min-height: 50dvh;
	}

	.wallboard__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: var(--space-4);
	}

	.wallboard__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-height: 56px;
	}

	.wallboard__reveal {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background: var(--black-card);
		border: 1px solid var(--grey-dim);
		border-left: 4px solid var(--cyan, #2ec5cc);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
	}

	.wallboard__reveal[data-kind='character_intro'] {
		border-left-color: var(--purple, #500df5);
	}

	.wallboard__reveal[data-kind='location_update'] {
		border-left-color: var(--red, #ff4d6a);
	}

	.wallboard__reveal-kind {
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--grey);
	}

	.wallboard__reveal-title {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		color: var(--white);
	}

	.wallboard__roll {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-left: auto;
		font-variant-numeric: tabular-nums;
	}

	.wallboard__roll-die {
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 700;
		color: var(--cyan, #2ec5cc);
	}

	.wallboard__roll-char {
		font-family: var(--font-ui);
		font-size: 16px;
		color: var(--grey);
	}

	.wallboard__roll-total {
		font-family: var(--font-mono);
		font-size: 32px;
		font-weight: 700;
		color: var(--white);
	}
</style>
