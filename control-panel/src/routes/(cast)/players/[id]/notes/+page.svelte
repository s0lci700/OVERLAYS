<script lang="ts">
	import type { PageData } from '../$types';
	import { browser } from '$app/environment';

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
		<!-- ── Quest Log (placeholder) ──────────────────────────── -->
		<section class="notes-section">
			<div class="notes-section-header">
				<h2 class="notes-section-title">QUEST LOG</h2>
				<span class="notes-section-meta">COMING SOON</span>
			</div>
			<div class="quest-placeholder">
				<span class="material-symbols-outlined quest-icon">explore</span>
				<span class="quest-placeholder-text">Quest tracking coming in Phase 2.</span>
			</div>
		</section>

		<!-- ── Scratchpad ────────────────────────────────────────── -->
		<section class="notes-section">
			<div class="notes-section-header">
				<h2 class="notes-section-title">SCRATCHPAD</h2>
				<span class="save-status">{savedStatus}</span>
			</div>
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

		<!-- ── Character Notes (from CharacterRecord) ───────────── -->
		{#if character.notes && character.notes.length > 0}
			<section class="notes-section">
				<div class="notes-section-header">
					<h2 class="notes-section-title">SESSION NOTES</h2>
					<span class="notes-section-meta">{character.notes.length} ENTRIES</span>
				</div>
				<div class="session-list">
					{#each character.notes as note, i}
						<article class="session-entry">
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

	/* ── Section ─────────────────────────────────────────────── */
	.notes-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.notes-section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(200, 148, 74, 0.25);
		padding-bottom: 4px;
	}

	.notes-section-title {
		font-family: var(--cast-font-identity);
		font-weight: 600;
		font-size: 1.125rem;
		letter-spacing: -0.02em;
		color: var(--cast-text-primary);
		margin: 0;
	}

	.notes-section-meta {
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		letter-spacing: 0.1em;
		color: rgba(200, 148, 74, 0.6);
	}

	/* ── Quest Placeholder ─────────────────────────────────── */
	.quest-placeholder {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(27, 27, 35, 0.60);
		backdrop-filter: blur(var(--cast-blur));
		border: 1px solid var(--cast-border-subtle);
		border-left: 2px solid rgba(200, 148, 74, 0.2);
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
	.save-status {
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: rgba(200, 148, 74, 0.6);
		text-transform: uppercase;
	}

	.scratchpad-container {
		position: relative;
		background: var(--cast-bg);
		border: 1px solid rgba(255, 255, 255, 0.1);
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
		background: rgba(27, 27, 35, 0.40);
		backdrop-filter: blur(var(--cast-blur));
		padding: 0.75rem;
		border-left: 1px solid rgba(200, 148, 74, 0.4);
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
</style>
