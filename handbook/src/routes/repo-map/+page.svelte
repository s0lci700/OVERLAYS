<script lang="ts">
	import { repoMap } from '$lib/content/repo-map';

	const REPO_BASE = 'https://github.com/s0lci700/OVERLAYS';

	function entryUrl(path: string, type: 'file' | 'dir'): string {
		const verb = type === 'dir' ? 'tree' : 'blob';
		return `${REPO_BASE}/${verb}/main/${path}`;
	}
</script>

<svelte:head>
	<title>Repo Map — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Repo Map</h1>
	<p class="page-subtitle">Key files and directories — annotated starting points for reading the codebase.</p>
</div>

<div class="map">
	{#each repoMap as section}
		<section class="map-section">
			<h2 class="section-label">{section.label}</h2>
			<ul class="entry-list">
				{#each section.entries as entry}
					<li class="entry">
						<a
							href={entryUrl(entry.path, entry.type)}
							target="_blank"
							rel="noopener noreferrer"
							class="entry-path"
						>
							{#if entry.type === 'dir'}📁{:else}📄{/if}
							{entry.path}
							<span class="ext-icon">↗</span>
						</a>
						<p class="entry-desc">{entry.description}</p>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.map {
		max-width: var(--content-max);
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.map-section {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	.map-section .section-label {
		margin-bottom: 1rem;
	}

	.entry-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.entry {
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.entry:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}

	.entry-path {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: monospace;
		font-size: 0.82rem;
		color: var(--purple);
		text-decoration: none;
		margin-bottom: 0.2rem;
	}

	.entry-path:hover {
		text-decoration: underline;
	}

	.ext-icon {
		font-size: 0.65rem;
		color: var(--text-dim);
		font-family: sans-serif;
	}

	.entry-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.5;
	}
</style>
