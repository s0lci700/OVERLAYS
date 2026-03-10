<script lang="ts">
	import type { Source } from '$lib/types/content';

	interface Props {
		sources: Source[];
	}

	let { sources }: Props = $props();

	const typeLabel: Record<string, string> = {
		docs: 'Docs',
		repo: 'Repo',
		arch: 'Architecture',
		external: 'External'
	};
</script>

{#if sources.length > 0}
	<aside class="source-block">
		<h4 class="source-heading">Sources & References</h4>
		<ul class="source-list">
			{#each sources as source}
				<li class="source-item">
					<span class="source-type" data-type={source.type}>
						{typeLabel[source.type] ?? source.type}
					</span>
					{#if source.url}
						<a href={source.url} target="_blank" rel="noopener noreferrer" class="source-label">
							{source.label} ↗
						</a>
					{:else if source.path}
						<span class="source-label source-path">{source.label}</span>
						<code class="source-path-code">{source.path}</code>
					{:else}
						<span class="source-label">{source.label}</span>
					{/if}
					{#if source.note}
						<span class="source-note">{source.note}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</aside>
{/if}

<style>
	.source-block {
		margin-top: 2.5rem;
		padding: 1.25rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		border-left: 3px solid var(--border);
	}

	.source-heading {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-dim);
		margin-bottom: 0.75rem;
	}

	.source-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.source-item {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
		font-size: 0.875rem;
	}

	.source-type {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.15em 0.5em;
		border-radius: 999px;
		border: 1px solid;
		flex-shrink: 0;
	}

	.source-type[data-type='docs'] {
		color: var(--source-docs);
		border-color: var(--source-docs);
	}
	.source-type[data-type='repo'] {
		color: var(--source-repo);
		border-color: var(--source-repo);
	}
	.source-type[data-type='arch'] {
		color: var(--source-arch);
		border-color: var(--source-arch);
	}
	.source-type[data-type='external'] {
		color: var(--source-external);
		border-color: var(--source-external);
	}

	.source-label {
		color: var(--text);
	}

	a.source-label {
		color: var(--text-link);
	}

	.source-path-code {
		font-family: monospace;
		font-size: 0.8em;
		color: var(--text-muted);
		background: var(--bg-card);
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
	}

	.source-note {
		color: var(--text-dim);
		font-size: 0.8em;
		font-style: italic;
	}
</style>
