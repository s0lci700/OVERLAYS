<script lang="ts">
	import type { CharacterRecord } from '$lib/contracts/records';
	import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
	import { ConditionPill } from '$lib/components/shared/condition-pill';
	import * as Tooltip from '$lib/components/shared/tooltip/index';
	import { CONDITION_TOOLTIPS } from '$lib/data/tooltips';

	let { character }: { character: CharacterRecord } = $props();

	const activeCount = $derived(character?.conditions?.length ?? 0);
</script>

<section class="conditions-panel" aria-label="Active conditions">
	<CastSectionHeader title="CONDITIONS" meta={activeCount > 0 ? `${activeCount} ACTIVE` : 'NONE'} />
	<div class="conditions-container">
		{#if activeCount === 0}
			<p class="empty-state">Sin condiciones activas</p>
		{:else}
			<Tooltip.Provider delayDuration={300}>
				<div class="conditions-list" role="list">
					{#each character.conditions as cond (cond.id)}
						{@const key = cond.condition_name.toLowerCase()}
						{@const tip = CONDITION_TOOLTIPS[key]}
						<div role="listitem">
							<Tooltip.Root>
								<Tooltip.Trigger>
									<!-- condition_name kept semantic; text-transform in CSS -->
									<ConditionPill variant="cast" label={cond.condition_name} />
								</Tooltip.Trigger>
								{#if tip}
									<Tooltip.Content
										class="max-w-220px rounded-none! border border-[rgba(255,255,255,0.08)] bg-[#1b1b23]! px-3! py-2! text-[#f0f0f0]!"
									>
										<p class="tip-name">{tip.name}</p>
										<p class="tip-desc">{tip.description}</p>
									</Tooltip.Content>
								{/if}
							</Tooltip.Root>
						</div>
					{/each}
				</div>
			</Tooltip.Provider>
		{/if}
	</div>
</section>

<style>
	.conditions-panel {
		container-type: inline-size;
	}

	.conditions-container {
		background-color: var(--cast-border-subtle);
	}

	.empty-state {
		font-family: var(--cast-font-chrome, 'Space Grotesk');
		font-size: 12px;
		color: var(--cast-text-secondary, #bac9cc);
		letter-spacing: 0.1em;
		text-align: center;
		padding: 0.875rem 0.75rem;
		text-transform: uppercase;
	}

	.conditions-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem;
	}

	/* Tooltip content — rendered in portal, styled via Tailwind class overrides.
     These classes target the injected tip text nodes inside the portal. */
	:global(.tip-name) {
		font-family: var(--cast-font-chrome, 'Space Grotesk');
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cast-amber, #c8944a);
		margin-bottom: 0.25rem;
	}

	:global(.tip-desc) {
		font-family: var(--cast-font-chrome, 'Space Grotesk');
		font-size: 11px;
		font-weight: 400;
		line-height: 1.4;
		color: var(--cast-text-primary, #f0f0f0);
	}
</style>
