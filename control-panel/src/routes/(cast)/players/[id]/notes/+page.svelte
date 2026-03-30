<script lang="ts">
	import type { PageData } from '../$types';
	import { browser } from '$app/environment';
	import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';

	let { data }: { data: PageData } = $props();
	const character = $derived(data.character);

	let scratchValue = $state('');
	let savedStatus = $state('SAVED');
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	// Load from localStorage on mount
	$effect(() => {
		if (browser) {
			const saved = localStorage.getItem('archive-scratch');
			if (saved !== null) scratchValue = saved;
		}
	});

	function onScratchInput() {
		if (browser) {
			localStorage.setItem('archive-scratch', scratchValue);
			savedStatus = '●';
			clearTimeout(saveTimer);
			saveTimer = setTimeout(() => {
				savedStatus = 'SAVED';
			}, 1000);
		}
	}
</script>

{#if character}
	<div class="notes-canvas">
		<section class="notes-panel">
			<CastSectionHeader title="QUEST LOG" meta="COMING SOON" />
			<div class="quest-placeholder cast-glass-panel">
				<span class="material-symbols-outlined quest-icon">explore</span>
				<span class="quest-placeholder-text">Quest tracking coming in Phase 2.</span>
			</div>
		</section>

		<section class="notes-panel">
			<CastSectionHeader title="SCRATCHPAD" meta={savedStatus} />
			<div class="scratchpad-container">
				<textarea
					class="scratchpad"
					placeholder="QUICK JOTTINGS..."
					bind:value={scratchValue}
					oninput={onScratchInput}
				></textarea>
				<div class="scratchpad-corners">
					<div class="corner-dot"></div>
					<div class="corner-dot corner-dot--dim"></div>
				</div>
			</div>
		</section>

		{#if character.notes && character.notes.length > 0}
			<section class="notes-panel">
				<CastSectionHeader title="SESSION NOTES" meta={`${character.notes.length} ENTRIES`} />
				<div class="session-list">
					{#each character.notes as note, i (`${i}-${note}`)}
						<article class="session-entry cast-glass-panel">
							<span class="session-index">#{String(i + 1).padStart(2, '0')}</span>
							<p class="session-body">{note}</p>
						</article>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}

<style>
	.notes-canvas {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 640px;
		margin: 0 auto;
	}

	.notes-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ── Quest Placeholder ─────────────────────────────────── */
	.quest-placeholder {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--cast-border-subtle);
		border-left: 2px solid rgba(200, 148, 74, 0.3);
	}

	.quest-icon {
		font-size: 18px;
		color: rgba(200, 148, 74, 0.4);
	}

	.quest-placeholder-text {
		font-family: var(--cast-font-chrome);
		font-size: 11px;
		color: rgba(240, 240, 240, 0.3);
		letter-spacing: 0.05em;
	}

	/* ── Scratchpad ──────────────────────────────────────────── */
	.scratchpad-container {
		position: relative;
		background: rgba(13, 13, 21, 0.5);
		border: 1px solid var(--cast-border-light);
		border-left: 2px solid var(--cast-amber);
		backdrop-filter: blur(var(--cast-blur));
	}

	.scratchpad {
		width: 100%;
		height: 8rem;
		background: transparent;
		border: none;
		outline: none;
		padding: 1rem;
		font-family: var(--cast-font-data);
		font-size: 12px;
		color: rgba(240, 240, 240, 0.7);
		line-height: 1.6;
		resize: none;
		box-sizing: border-box;
	}

	.scratchpad::placeholder {
		color: rgba(240, 240, 240, 0.2);
		letter-spacing: 0.1em;
	}

	.scratchpad-corners {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		gap: 3px;
	}

	.corner-dot {
		width: 4px;
		height: 4px;
		background: var(--cast-amber);
	}

	.corner-dot--dim {
		background: rgba(200, 148, 74, 0.4);
	}

	/* ── Session Entries ─────────────────────────────────────── */
	.session-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.session-entry {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		gap: 0.75rem;
		padding: 0.75rem;
		border: 1px solid var(--cast-border-subtle);
		border-left: 2px solid rgba(200, 148, 74, 0.35);
	}

	.session-index {
		font-family: var(--cast-font-data);
		font-size: 10px;
		color: var(--cast-amber);
		padding-top: 2px;
	}

	.session-body {
		font-family: var(--cast-font-chrome);
		font-size: 13px;
		line-height: 1.6;
		color: rgba(240, 240, 240, 0.7);
		margin: 0;
	}

	@media (min-width: 768px) {
		.notes-canvas {
			padding: 2.5rem 1.5rem;
			gap: 2rem;
		}
	}
</style>
