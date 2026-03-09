<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';
	import ProgressBadge from '$lib/components/ProgressBadge.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	let { data } = $props();
	const pack = $derived(data.pack);
	const topics = $derived(data.topics);

	// Build a plain-text context block for LLM usage
	const contextBlock = $derived(() => {
		const lines: string[] = [
			`# Context Pack: ${pack.title}`,
			'',
			pack.description,
			'',
			'---',
			''
		];

		for (const topic of topics) {
			lines.push(`## ${topic.title}`);
			lines.push('');
			lines.push(`> ${topic.summary}`);
			lines.push('');
			lines.push(topic.content);
			lines.push('');
			lines.push('---');
			lines.push('');
		}

		return lines.join('\n');
	});
</script>

<svelte:head>
	<title>{pack.title} — Context Packs — TableRelay Handbook</title>
</svelte:head>

<div class="pack-page">
	<div class="pack-meta">
		<a href="/context-packs" class="back-link">← Context Packs</a>
	</div>

	<header class="pack-header">
		<h1 class="pack-title">{pack.title}</h1>
		<p class="pack-desc">{pack.description}</p>
		<div class="pack-actions">
			<CopyButton text={contextBlock()} label="Copy full context" />
			<a
				href="/api/context-packs/{pack.slug}"
				target="_blank"
				class="json-link"
			>
				JSON ↗
			</a>
		</div>
	</header>

	<div class="topic-list">
		{#each topics as topic, i}
			<article class="topic-entry">
				<div class="entry-head">
					<span class="entry-num">#{i + 1}</span>
					<a href="/topics/{topic.slug}" class="entry-title">{topic.title}</a>
					<ProgressBadge status={progress.getStatus(topic.slug)} />
				</div>
				<p class="entry-summary">{topic.summary}</p>
				{#if topic.tags.length > 0}
					<div class="entry-tags">
						{#each topic.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</article>
		{/each}
	</div>
</div>

<style>
	.pack-page {
		max-width: var(--content-max);
	}

	.pack-meta {
		margin-bottom: 1.25rem;
	}

	.back-link {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-decoration: none;
	}

	.back-link:hover {
		color: var(--text);
	}

	.pack-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.pack-title {
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 0.5rem;
	}

	.pack-desc {
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.pack-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.json-link {
		font-size: 0.75rem;
		color: var(--text-dim);
		font-family: monospace;
		padding: 0.3em 0.7em;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		text-decoration: none;
		background: var(--bg-surface);
		transition: color 0.15s;
	}

	.json-link:hover {
		color: var(--text-muted);
		text-decoration: none;
	}

	.topic-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.topic-entry {
		padding: 1.1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.entry-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.4rem;
		flex-wrap: wrap;
	}

	.entry-num {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text-dim);
		font-variant-numeric: tabular-nums;
		min-width: 1.5rem;
	}

	.entry-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		flex: 1;
	}

	.entry-title:hover {
		color: var(--cyan);
		text-decoration: none;
	}

	.entry-summary {
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}

	.entry-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
</style>
