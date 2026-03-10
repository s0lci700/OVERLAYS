<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';

	interface Decision {
		id: string;
		title: string;
		status: 'settled' | 'revisit';
		decision: string;
		rationale: string;
		tradeoffs?: string;
	}

	const decisions: Decision[] = [
		{
			id: 'socket-broadcast',
			title: 'Socket.io as broadcast bus for all state',
			status: 'settled',
			decision: 'All state changes are broadcast to all connected clients via Socket.io, not per-client REST responses.',
			rationale: 'Keeps overlays, control panel, and any other connected surface in sync automatically. No polling needed.',
			tradeoffs: 'All clients receive all events — no filtering by surface. Acceptable for current scale.'
		},
		{
			id: 'pocketbase-persistence',
			title: 'PocketBase as sole persistence layer',
			status: 'settled',
			decision: 'State lives in PocketBase (SQLite). server.js authenticates as superuser on startup.',
			rationale: 'Simple self-hosted persistence with a REST API and admin UI. Avoids managing raw SQL migrations for a project of this scale.',
			tradeoffs: 'PocketBase must be running before the Node server. PocketBase startup failure = server exit.'
		},
		{
			id: 'overlays-passive',
			title: 'Overlays are passive clients',
			status: 'settled',
			decision: 'Audience overlays only receive socket events. They never send REST requests or emit socket messages.',
			rationale: 'Overlays run in OBS browser sources. Keeping them read-only prevents stale overlay state from affecting game data and simplifies crash recovery.',
			tradeoffs: 'Overlays cannot self-correct if they miss an event — they rely on reconnect + initialData.'
		},
		{
			id: 'ui-layer',
			title: 'ui/ wraps bits-ui, everything else composes from ui/',
			status: 'settled',
			decision: 'Low-level primitives live in ui/. Feature components in stage/ and cast/ compose from ui/, not directly from bits-ui.',
			rationale: 'Single choke point for design decisions. Swapping a primitive library requires changing only ui/, not every feature component.',
			tradeoffs: 'Extra indirection. Justified once ui/ is stable.'
		},
		{
			id: 'data-layer-pb',
			title: 'data/characters.js wraps all PocketBase calls',
			status: 'settled',
			decision: 'server.js never calls PocketBase directly — it always goes through data/characters.js and data/rolls.js.',
			rationale: 'Keeps PocketBase details (field names, collection names, error shapes) in one place.',
			tradeoffs: 'Additional indirection. Worth it once PocketBase schema evolves.'
		},
		{
			id: 'token-generator',
			title: 'Design tokens compiled from JSON source',
			status: 'settled',
			decision: 'design/tokens.json is the canonical token source. Generated CSS files are never edited directly.',
			rationale: 'Single source of truth for the design language. Token changes automatically propagate to all CSS consumers.',
			tradeoffs: 'Must run bun run generate:tokens after any token edit. Generated files must be committed.'
		}
	];
</script>

<svelte:head>
	<title>Architecture Decisions — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Architecture Decisions</h1>
	<p class="page-subtitle">
		Key decisions in OVERLAYS — what was decided, why, and trade-offs accepted.
	</p>
</div>

<div class="decisions">
	{#each decisions as d}
		<article class="decision" id={d.id}>
			<div class="decision-head">
				<h2 class="decision-title">{d.title}</h2>
				<span class="status-badge" data-status={d.status}>
					{d.status === 'settled' ? 'Settled' : 'Revisit'}
				</span>
			</div>

			<dl class="decision-body">
				<div class="decision-row">
					<dt>Decision</dt>
					<dd>{d.decision}</dd>
				</div>
				<div class="decision-row">
					<dt>Rationale</dt>
					<dd>{d.rationale}</dd>
				</div>
				{#if d.tradeoffs}
					<div class="decision-row">
						<dt>Trade-offs</dt>
						<dd>{d.tradeoffs}</dd>
					</div>
				{/if}
			</dl>

			<div class="decision-footer">
				<CopyButton
					text={`## ${d.title}\n\n**Decision:** ${d.decision}\n\n**Rationale:** ${d.rationale}${d.tradeoffs ? `\n\n**Trade-offs:** ${d.tradeoffs}` : ''}`}
					label="Copy"
				/>
			</div>
		</article>
	{/each}
</div>

<style>
	.decisions {
		max-width: var(--content-max);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.decision {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.decision-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.decision-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}

	.status-badge {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2em 0.6em;
		border-radius: 999px;
		border: 1px solid;
		flex-shrink: 0;
	}

	.status-badge[data-status='settled'] {
		color: var(--status-solid);
		border-color: var(--status-solid);
	}

	.status-badge[data-status='revisit'] {
		color: var(--red);
		border-color: var(--red);
	}

	.decision-body {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1rem;
	}

	.decision-row {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 0.75rem;
		font-size: 0.85rem;
	}

	dt {
		color: var(--text-dim);
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding-top: 0.1rem;
	}

	dd {
		color: var(--text-muted);
		line-height: 1.55;
	}

	.decision-footer {
		display: flex;
		justify-content: flex-end;
	}

	@media (max-width: 480px) {
		.decision-row {
			grid-template-columns: 1fr;
			gap: 0.2rem;
		}
	}
</style>
