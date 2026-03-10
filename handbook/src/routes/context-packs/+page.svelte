<script lang="ts">
	import { contextPacks } from '$lib/content/context-packs';
	import { allTopics } from '$lib/content/topics';

	function topicCount(topics: string[]) {
		return topics.length;
	}

	function topicTitles(slugs: string[]) {
		return slugs.map((s) => allTopics.find((t) => t.slug === s)?.title ?? s);
	}
</script>

<svelte:head>
	<title>Context Packs — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Context Packs</h1>
	<p class="page-subtitle">
		Curated topic bundles ready to copy as context for LLMs or external tools.
	</p>
</div>

<div class="packs">
	{#each contextPacks as pack}
		<a href="/context-packs/{pack.slug}" class="pack-card">
			<div class="pack-head">
				<h2 class="pack-title">{pack.title}</h2>
				<span class="pack-count">{topicCount(pack.topics)} topics</span>
			</div>
			<p class="pack-desc">{pack.description}</p>
			<ul class="pack-topics">
				{#each topicTitles(pack.topics) as title}
					<li>{title}</li>
				{/each}
			</ul>
			{#if pack.tags}
				<div class="pack-tags">
					{#each pack.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</a>
	{/each}
</div>

<div class="machine-note">
	<span class="section-label">Machine-readable</span>
	<p>Each pack is also available as JSON at <code>/api/context-packs/[slug]</code>.</p>
</div>

<style>
	.packs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 0.75rem;
		margin-bottom: 2rem;
		max-width: var(--content-max);
	}

	.pack-card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1.25rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.pack-card:hover {
		background: var(--bg-hover);
		border-color: var(--text-dim);
		text-decoration: none;
	}

	.pack-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.pack-title {
		flex: 1;
		min-width: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
	}

	.pack-count {
		font-size: 0.7rem;
		color: var(--text-dim);
		white-space: nowrap;
	}

	.pack-desc {
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	.pack-topics {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.pack-topics li {
		font-size: 0.78rem;
		color: var(--text-dim);
		padding-left: 0.75rem;
		position: relative;
	}

	.pack-topics li::before {
		content: '·';
		position: absolute;
		left: 0;
		color: var(--text-dim);
	}

	.pack-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.machine-note {
		max-width: var(--content-max);
		padding: 1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.machine-note p {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.machine-note code {
		font-size: 0.8em;
		color: var(--cyan);
		background: var(--bg-card);
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
	}
</style>
