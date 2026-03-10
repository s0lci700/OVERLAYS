<script lang="ts">
	interface GlossaryEntry {
		term: string;
		definition: string;
		context?: string;
	}

	const glossary: GlossaryEntry[] = [
		{
			term: 'Rune',
			definition: 'A Svelte 5 compiler directive prefixed with $: $state, $derived, $effect, $props. Not JavaScript — the Svelte compiler transforms them.',
			context: 'Svelte 5'
		},
		{
			term: 'Snippet',
			definition: 'A reusable block of markup defined with {#snippet name()} and rendered with {@render name()}. Replaces named slots from Svelte 4.',
			context: 'Svelte 5'
		},
		{
			term: 'Socket.io event',
			definition: 'A named message broadcast from server.js to all connected clients. Triggers store updates in socket.js which re-render Svelte components.',
			context: 'Architecture'
		},
		{
			term: 'initialData',
			definition: 'The full character roster + recent rolls emitted to each new Socket.io connection. Bootstraps client state on load.',
			context: 'Architecture'
		},
		{
			term: 'Headless component',
			definition: 'A component that handles behaviour and accessibility (keyboard nav, ARIA, focus) without imposing any visual style. bits-ui provides these.',
			context: 'UI Library'
		},
		{
			term: 'Contract',
			definition: 'The agreed-upon shape of data passed between two parts of the system. In TypeScript: an interface or type alias that both sides depend on.',
			context: 'Architecture'
		},
		{
			term: 'Boundary',
			definition: 'A separation point between layers. OVERLAYS has boundaries between PocketBase, server.js, Socket.io, the client store, and component props.',
			context: 'Architecture'
		},
		{
			term: 'Design token',
			definition: 'A named design decision stored in design/tokens.json and compiled to CSS custom properties. Examples: --color-hp-full, --spacing-md.',
			context: 'Styling'
		},
		{
			term: 'Passive overlay',
			definition: 'An audience overlay that only receives socket events and never sends requests or emits events. All routes under (audience)/ follow this rule.',
			context: 'Architecture'
		},
		{
			term: 'PocketBase SDK wrapper',
			definition: 'A function in data/characters.js that takes (pb, ...) as the first argument, calls PocketBase\'s JS SDK, and returns domain objects.',
			context: 'Backend'
		},
		{
			term: 'tailwind-variants (tv)',
			definition: 'A utility for composing CSS class variants without manual string concatenation. Used in ui/ components for intent, size, and state variants.',
			context: 'UI Library'
		},
		{
			term: 'BEM-style state class',
			definition: 'CSS classes with is- prefix that represent component state. Examples: .is-critical, .is-selected, .is-collapsed. Defined in utilities.css.',
			context: 'Styling'
		}
	];

	let filter = $state('');

	const filtered = $derived(
		filter
			? glossary.filter(
					(e) =>
						e.term.toLowerCase().includes(filter.toLowerCase()) ||
						e.definition.toLowerCase().includes(filter.toLowerCase())
				)
			: glossary
	);
</script>

<svelte:head>
	<title>Patterns & Glossary — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Patterns & Glossary</h1>
	<p class="page-subtitle">Terms, patterns, and conventions used across OVERLAYS.</p>
</div>

<div class="filter-row">
	<input
		type="search"
		placeholder="Filter terms…"
		bind:value={filter}
		class="filter-input"
	/>
	<span class="filter-count">{filtered.length} of {glossary.length}</span>
</div>

<dl class="glossary">
	{#each filtered as entry}
		<div class="entry">
			<dt class="entry-term">
				{entry.term}
				{#if entry.context}
					<span class="entry-context">{entry.context}</span>
				{/if}
			</dt>
			<dd class="entry-def">{entry.definition}</dd>
		</div>
	{:else}
		<p class="empty">No terms match "{filter}".</p>
	{/each}
</dl>

<style>
	.filter-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		max-width: var(--content-max);
	}

	.filter-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text);
		font-size: 0.875rem;
		outline: none;
	}

	.filter-input:focus {
		border-color: var(--cyan);
	}

	.filter-input::placeholder {
		color: var(--text-dim);
	}

	.filter-count {
		font-size: 0.75rem;
		color: var(--text-dim);
		white-space: nowrap;
	}

	.glossary {
		max-width: var(--content-max);
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.entry {
		padding: 1rem 0;
		border-bottom: 1px solid var(--border-subtle);
	}

	.entry:last-child {
		border-bottom: none;
	}

	.entry-term {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 0.3rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.entry-context {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.15em 0.5em;
		border-radius: 999px;
		background: var(--bg-card);
		color: var(--text-dim);
		border: 1px solid var(--border);
		font-style: normal;
	}

	.entry-def {
		font-size: 0.85rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	.empty {
		color: var(--text-dim);
		font-size: 0.875rem;
		padding: 1rem 0;
	}
</style>
