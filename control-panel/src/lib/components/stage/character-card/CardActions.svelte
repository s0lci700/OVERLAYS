<script lang="ts">
	import { ConditionPill } from '$lib/components/shared/condition-pill/index';
	import { Stepper } from '$lib/components/shared/stepper/index';
	import { Button } from '$lib/components/shared/button/index';
	import * as Tooltip from '$lib/components/shared/tooltip/index';
	import { SERVER_URL } from '$lib/services/socket.svelte';
	import { mutateHp, removeCondition, selectCharacter, updateResource } from '$lib/derived/stage.svelte';
	import type { CharacterRecord } from '$lib/contracts/records';
	// ──────────────────────────────────────────────────────────────────────────

	/** Inline error message shown inside the card (replaces window.alert). */
	let cardError = $state('');
	let cardErrorTimer;

	/** Loading guard — prevents spam-clicking action buttons during API calls. */
	let isUpdating = $state(false);

	function showCardError(msg) {
		cardError = msg;
		clearTimeout(cardErrorTimer);
		cardErrorTimer = setTimeout(() => (cardError = ''), 4000);
	}

	let { character } : { data: any, character: CharacterRecord } = $props();

	// ──────────────────────────────────────────────────────────────────────────
	// State Management
	// ──────────────────────────────────────────────────────────────────────────

	/** Amount of HP to apply per damage/heal action (range: 1-999). */
	let amount = $state(1);

	// ──────────────────────────────────────────────────────────────────────────
	// Condition Management
	// ──────────────────────────────────────────────────────────────────────────

	/**
	 * Removes a condition (status effect) from the character.
	 * Sends DELETE request to server, which broadcasts removal to all clients.
	 *
	 * @param {string} conditionId - ID of the condition to remove
	 */
	// async function removeCondition(conditionId) {
	// 	try {
	// 		const response = await fetch(
	// 			`${SERVER_URL}/api/characters/${character.id}/conditions/${conditionId}`,
	// 			{ method: 'DELETE' }
	// 		);
	// 		if (!response.ok) throw new Error(`${response.status}`);
	// 	} catch {
	// 		showCardError('Error al eliminar condición. Intenta nuevamente.');
	// 	}
	// }

	/**
	 * Triggers a short or long rest, restoring resources per D&D rules.
	 * Server resets pools and distributes hit dice as appropriate.
	 *
	 * @param {'short' | 'long'} type - Whether a short or long rest
	 */
	async function takeRest(type) {
		if (isUpdating) return;
		isUpdating = true;
		try {
			const response = await fetch(`${SERVER_URL}/api/characters/${character.id}/rest`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type })
			});
			if (!response.ok) throw new Error(`${response.status}`);
		} catch {
			showCardError('Error al aplicar descanso. Intenta nuevamente.');
		} finally {
			isUpdating = false;
		}
	}

	// ──────────────────────────────────────────────────────────────────────────
	// HP & Damage API
	// ──────────────────────────────────────────────────────────────────────────

	/**
	 * Updates character HP by applying damage or healing.
	 * Clamps result between 0 and max HP, sends to server, which broadcasts
	 * the change to all clients and enables the damage flash animation.
	 *
	 * @param {'damage' | 'heal'} type - Whether to subtract or add HP
	 */
	// async function updateHp(type) {
	//   if (isUpdating) return;
	//   isUpdating = true;

	//   if (typeof navigator !== 'undefined' && navigator.vibrate) {
	//     navigator.vibrate(40);
	//   }

	//   const delta = type === 'damage' ? -amount : amount;
	//   const hp_current = Math.max(0, Math.min(character.hp_current + delta, character.hp_max));

	//   try {
	//     const response = await fetch(`${SERVER_URL}/api/characters/${character.id}/hp`, {
	//       method: "PUT",
	//       headers: { "Content-Type": "application/json" },
	//       body: JSON.stringify({ hp_current }),
	//     });

	//     if (!response.ok) {
	//       throw new Error(`Failed to update HP: ${response.status}`);
	//     }
	//   } catch (err) {
	//     console.error("[CardActions] HP update failed:", err);
	//     showCardError("Error al actualizar HP. Intenta nuevamente.");
	//   } finally {
	//     isUpdating = false;
	//   }
	// }

	// ──────────────────────────────────────────────────────────────────────────
	// Resource Management (Spell Slots, Action Economy, etc.)
	// ──────────────────────────────────────────────────────────────────────────

	/**
	 * Toggles a resource pip (spent/unspent).
	 * If pip is filled (spent), decrement pool_current; if empty, increment.
	 * Sends update to server, which broadcasts to all clients.
	 *
	 * @param {Object} resource - The resource object (spell slots, etc.)
	 * @param {boolean} isFilled - Whether the pip is currently filled (spent)
	 */
	// async function togglePip(resource, isFilled) {
	// 	const newCurrent = isFilled ? resource.pool_current - 1 : resource.pool_current + 1;
	// 	try {
	// 		const response = await fetch(
	// 			`${SERVER_URL}/api/characters/${character.id}/resources/${resource.id}`,
	// 			{
	// 				method: 'PUT',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({ pool_current: newCurrent })
	// 			}
	// 		);
	// 		if (!response.ok) throw new Error(`${response.status}`);
	// 	} catch {
	// 		showCardError('Error al actualizar recurso. Intenta nuevamente.');
	// 	}
	// }
</script>

<!-- END OF SCRIPTS -->
<!--
  CardActions
  ===========
  Renders action buttons and controls for a character card, including:
-->

{#if cardError}
	<div class="card-toast" role="alert">
		<span class="card-toast-msg">{cardError}</span>
		<button class="card-toast-close" onclick={() => (cardError = '')} aria-label="Cerrar"
			>&times;</button
		>
	</div>
{/if}

<!-- Resource pools (spell slots, action economy, etc.) with pip UI -->
{#if character.resources && character.resources.length > 0}
	<div class="resources-section">
		{#each character.resources as resource (resource.id)}
			<div class="resource-row">
				<span class="label-caps">{resource.name}</span>
				<!-- Clickable pip buttons for spending/recovering resources -->
				<div class="resource-pips">
					{#each Array(resource.pool_max) as _, i (i)}
						{@const filled = i < resource.pool_current}
						<button
							class="pip pip--{resource.reset_on.toLowerCase()} {filled
								? 'pip--filled'
								: 'pip--empty'}"
							onclick={() => updateResource(character.id, resource.id, { delta: filled ? resource.pool_current - 1 : resource.pool_current + 1 })}
							aria-label="{filled ? 'Gastar' : 'Recuperar'} {resource.name}"
						></button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

<!-- Conditions/status effects (removable with close button) -->
{#if character.conditions && character.conditions.length > 0}
	<Tooltip.Provider delayDuration={400}>
		<div class="conditions-row">
			{#each character.conditions as condition (condition.id)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<ConditionPill
							class="condition-pill"
							label={condition.condition_name}
							variant="condition"
							interactive
							onRemove={() => removeCondition(character.id, condition.id)}
						/>
					</Tooltip.Trigger>
					<Tooltip.Content class="help">Clic para eliminar condición</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</div>
	</Tooltip.Provider>
{/if}

<!-- Short/long rest buttons to restore resources -->
<fieldset class="rest-buttons">
	<legend class="rest-label">DESCANSOS</legend>
	<Button class="btn-rest" onclick={() => takeRest('short')} disabled={isUpdating}>CORTO</Button>
	<Button class="btn-rest" onclick={() => takeRest('long')} disabled={isUpdating}>LARGO</Button>
</fieldset>

<!-- HP damage/healing controls -->
<div class="char-controls">
	<Button
		class="btn-damage"
		disabled={isUpdating}
		onclick={() => mutateHp(character.id, { delta: -amount })}
	>
		DMG
	</Button>

	<!-- Stepper control for adjusting damage/healing amount -->
	<Stepper class="hp-stepper" bind:value={amount} min={1} max={999} size="sm" />

	<Button
		class="btn-heal"
		disabled={isUpdating}
		onclick={() => mutateHp(character.id, { delta: amount })}
	>
		HEAL
	</Button>
</div>
