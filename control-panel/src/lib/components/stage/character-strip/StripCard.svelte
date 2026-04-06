<!--
  StripCard
  =========
  Compact expandable character card for the left strip.
  Shows photo, name, HP bar, and condition dots in compact mode.
  Expands to reveal DMG/HEAL controls and full condition management.
-->
<script lang="ts">
	import './StripCard.css';
	import type { CharacterRecord } from '$lib/contracts/records';
	import { HP_THRESHOLDS } from '$lib/contracts/stage.js';
	import { mutateHp, addCondition, removeCondition } from '$lib/derived/stage.svelte';
	import { resolvePhotoSrc } from '$lib/services/utils.js';
	import { SERVER_URL } from '$lib/services/socket.svelte.js';
	import dwarfFallback from '$lib/assets/img/dwarf.webp';
	import { Stepper } from '$lib/components/shared/stepper/index';
	import { ConditionPill } from '$lib/components/shared/condition-pill/index';
	import { HoldButton } from '$lib/components/shared/hold-button/index';
	import { UndoToast } from '$lib/components/shared/undo-toast/index';
	import ConditionDot from './ConditionDot.svelte';
	import ConditionPopover from './ConditionPopover.svelte';
	import { animate } from 'animejs';
	import { onMount } from 'svelte';
	import { makeWheelHandler, type WheelHandler } from '$lib/utils/utils';

	let {
		character,
		isExpanded = false,
		onExpandRequest
	}: {
		character: CharacterRecord;
		isExpanded?: boolean;
		onExpandRequest: (id: string) => void;
	} = $props();

	let amount = $state(1);
	let showConditionPopover = $state(false);
	let hitFlashEl: HTMLElement | undefined;
	let critFlashEl: HTMLElement | undefined;
	let cardEl: HTMLElement | undefined;
	let prevHp = 0;

	let hpWheelHandler: WheelHandler = makeWheelHandler(
		() => amount,
		(newHp) => (amount = newHp),
		0,
		99
	);

	onMount(() => {
		prevHp = character.hp_current;
	});


	$effect(() => {
		const hp = character.hp_current;
		const delta = hp - prevHp;
		const isDmg = delta < 0;
		const isHeal = delta > 0;

		if (isDmg && hitFlashEl) {
			// Regular hit flash
			hitFlashEl.style.opacity = '0.5';
			animate(hitFlashEl, { opacity: 0, duration: 900, ease: 'outCubic' });

			// Critical Damage (>30% max HP)
			if (Math.abs(delta) >= character.hp_max * 0.3) {
				if (cardEl) {
					cardEl.classList.add('shake');
					setTimeout(() => cardEl?.classList.remove('shake'), 300);
				}
				if (critFlashEl) {
					critFlashEl.className = 'critical-flash critical-flash--dmg';
					animate(critFlashEl, { opacity: [0, 0.8, 0], duration: 1200, ease: 'outExpo' });
				}
			}
		}

		if (isHeal && hp === character.hp_max && critFlashEl) {
			// Critical Heal (Restored to Full)
			critFlashEl.className = 'critical-flash critical-flash--heal';
			animate(critFlashEl, { opacity: [0, 0.6, 0], duration: 1500, ease: 'outExpo' });
		}

		prevHp = hp;
	});

	const hpPercent = $derived(character.hp_current / character.hp_max);
	const hpClass = $derived(
		hpPercent * 100 > HP_THRESHOLDS.HEALTHY
			? 'hp--healthy'
			: hpPercent * 100 > HP_THRESHOLDS.INJURED
				? 'hp--injured'
				: 'hp--critical'
	);

	const isCritical = $derived(hpPercent * 100 <= HP_THRESHOLDS.INJURED);
	const isDead = $derived(character.hp_current <= 0);

	const photoSrc = $derived(resolvePhotoSrc(character.portrait, SERVER_URL) ?? dwarfFallback);

	type Snapshot = { id: string; hp: number }[];
	let toast = $state<{ label: string; snapshot: Snapshot } | null>(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = null;

	function showToast(label: string, snapshot: Snapshot) {
		if (toastTimeout) clearTimeout(toastTimeout);
		toast = { label, snapshot };
		toastTimeout = setTimeout(clearToast, 3000);
	}

	function clearToast() {
		toast = null;
		toastTimeout = null;
	}

	function undoAmount() {
		if (!toast) return;
		const snap = toast.snapshot[0];
		mutateHp(snap.id, { delta: snap.hp - character.hp_current });
		clearToast();
	}
</script>

<div
	bind:this={cardEl}
	class="strip-card"
	class:is-expanded={isExpanded}
	class:is-critical={isCritical}
	class:is-dead={isDead}
	data-char-id={character.id}
	onclick={() => !isExpanded && onExpandRequest(character.id)}
	onkeydown={(e) => {
		if (!isExpanded && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			onExpandRequest(character.id);
		}
	}}
	role="button"
	tabindex="0"
	aria-expanded={isExpanded}
	aria-label={character.name}
>
	<!-- Flash overlays -->
	<div class="hit-flash" bind:this={hitFlashEl}></div>
	<div class="critical-flash" bind:this={critFlashEl}></div>

	{#if isDead}
		<div class="death-marker" aria-hidden="true"></div>
	{/if}

	<!-- Compact row -->
	<div class="strip-card__compact">
		<img
			src={photoSrc}
			alt={character.name}
			class="strip-card__photo"
			width="44"
			height="44"
			loading="lazy"
			decoding="async"
		/>
		<div class="strip-card__identity">
			<span class="strip-card__name">{character.name}</span>
			<div class="strip-card__hp-nums">
				<span class="hp-cur" class:is-critical={isCritical}>{character.hp_current}</span>
				<span class="hp-sep">/</span>
				<span class="hp-max">{character.hp_max}</span>
			</div>
		</div>
		<button
			class="strip-card__expand-btn"
			onclick={(e) => {
				e.stopPropagation();
				onExpandRequest(character.id);
			}}
			aria-expanded={isExpanded}
			aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
		>
			<svg
				viewBox="0 0 24 24"
				width="14"
				height="14"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				style="transition: transform var(--t-normal); transform: rotate({isExpanded
					? '180deg'
					: '0deg'})"
			>
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</button>
	</div>

	<!-- HP bar (always visible) -->
	<div
		class="hp-track"
		role="progressbar"
		aria-valuemin={0}
		aria-valuenow={character.hp_current}
		aria-valuemax={character.hp_max}
		aria-label="Puntos de vida"
	>
		<div class="hp-ghost" style="transform: scaleX({hpPercent})"></div>
		<div class="hp-fill {hpClass}" style="transform: scaleX({hpPercent})"></div>
	</div>

	<!-- Condition dots (compact, hidden when expanded) -->
	{#if !isExpanded && (character.conditions?.length ?? 0) > 0}
		<div class="strip-card__dots">
			{#each (character.conditions ?? []).slice(0, 8) as condition (condition.id)}
				<ConditionDot {condition} />
			{/each}
			{#if (character.conditions?.length ?? 0) > 8}
				<span class="dots-overflow">+{(character.conditions?.length ?? 0) - 8}</span>
			{/if}
		</div>
	{/if}

	<!-- Expanded section -->
	{#if isExpanded}
		<div class="strip-card__expanded">
			<hr class="strip-card__divider" />

			<!-- DMG / HEAL controls -->
			<div class="strip-card__controls">
				<HoldButton
					variant="dmg"
					label="DAÑO"
					holdDuration={200}
					style="flex:1;"
					onConfirm={() => {
						const snapshot: Snapshot = [{ id: character.id, hp: character.hp_current }];
						mutateHp(character.id, { delta: -amount });
						showToast('Daño aplicado', snapshot);
					}}
					ariaLabel={`Mantener para aplicar ${amount} de daño a ${character.name}`}
				/>
				<Stepper onwheel={hpWheelHandler} bind:value={amount} min={1} max={999} size="sm" />
				<HoldButton
					variant="heal"
					label="CURAR"
					holdDuration={200}
					style="flex:1;"
					onConfirm={() => {
						const snapshot: Snapshot = [{ id: character.id, hp: character.hp_current }];
						mutateHp(character.id, { delta: amount });
						showToast('Sanación aplicada', snapshot);
					}}
					ariaLabel={`Mantener para aplicar ${amount} de sanación a ${character.name}`}
				/>
			</div>

			<!-- Conditions -->
			<div class="strip-card__conditions">
				{#each character.conditions ?? [] as condition (condition.id)}
					<ConditionPill
						label={condition.condition_name}
						variant="condition"
						interactive
						onRemove={() => removeCondition(character.id, condition.id)}
					/>
				{/each}
				<div class="condition-add-wrapper">
					<button
						class="btn-add-condition"
						onclick={() => (showConditionPopover = !showConditionPopover)}
					>
						+ condición
					</button>
					{#if showConditionPopover}
						<ConditionPopover
							characterId={character.id}
							onSelect={(conditionName) => {
								addCondition(character.id, conditionName);
								showConditionPopover = false;
							}}
							onClose={() => (showConditionPopover = false)}
						/>
					{/if}
				</div>
			</div>

			{#if toast}
				<UndoToast label={toast.label} onUndo={undoAmount} />
			{/if}
		</div>
	{/if}
</div>
