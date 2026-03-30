<script lang="ts">
	import type { PageData } from '../$types';
	import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';

	let { data }: { data: PageData } = $props();
	const character = $derived(data.character);
</script>

{#if character}
	<div class="magic-canvas">
		<section class="magic-panel cast-glass-panel">
			<CastSectionHeader title="SPELLBOOK" meta="PHASE 2" />

			<div class="magic-placeholder">
				<div class="placeholder-icon">
					<span class="material-symbols-outlined">auto_stories</span>
				</div>
				<h2 class="placeholder-title">Arcana Archive Pending</h2>
				<p class="placeholder-body">
					Spell slot tracking and spellbook rendering are queued for the next phase. This screen
					will inherit the same deep-glass spell cards, slot geometry, and lavender-only magic
					accents defined for the cast layer.
				</p>
				<div class="placeholder-meta">
					<span class="meta-chip">SPELL DATA INTEGRATION NEXT</span>
				</div>
			</div>
		</section>
	</div>
{:else}
	<div class="magic-canvas">
		<p class="empty-state">Character not found.</p>
	</div>
{/if}

<style>
	.magic-canvas {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 640px;
		margin: 0 auto;
	}

	.magic-panel {
		padding: 1rem;
		border: 1px solid var(--cast-border-subtle);
		border-left: 2px solid rgba(205, 189, 255, 0.55);
	}

	.magic-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2.5rem 1.25rem 1.5rem;
		text-align: center;
	}

	.placeholder-icon {
		color: var(--cast-lavender);
		opacity: 0.6;
	}

	.placeholder-icon .material-symbols-outlined {
		font-size: 36px;
	}

	.placeholder-title {
		font-family: var(--cast-font-identity);
		font-weight: 600;
		font-size: 1.25rem;
		letter-spacing: -0.02em;
		color: var(--cast-text-primary);
		margin: 0;
	}

	.placeholder-body {
		font-family: var(--cast-font-prose);
		font-size: 13px;
		line-height: 1.6;
		color: rgba(240, 240, 240, 0.5);
		max-width: 280px;
		margin: 0;
	}

	.placeholder-meta {
		margin-top: 0.5rem;
	}

	.meta-chip {
		padding: 3px 10px;
		border-radius: var(--cast-radius-pill);
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: rgba(205, 189, 255, 0.6);
		border: 1px solid rgba(205, 189, 255, 0.2);
		background: rgba(205, 189, 255, 0.05);
	}

	.empty-state {
		font-family: var(--cast-font-chrome);
		font-size: 12px;
		color: var(--cast-text-secondary);
		letter-spacing: 0.1em;
		padding: 2rem;
		text-align: center;
	}

	@media (min-width: 768px) {
		.magic-canvas {
			padding: 2.5rem 1.5rem;
		}
	}
</style>
