<script lang="ts">
	import { learningPath } from '$lib/content/learning-path';
	import { progress } from '$lib/stores/progress.svelte';
	import SourceBlock from '$lib/components/SourceBlock.svelte';
	import RepoLinks from '$lib/components/RepoLinks.svelte';
	import ProgressBadge from '$lib/components/ProgressBadge.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import type { ProgressStatus } from '$lib/types/content';

	let { data } = $props();
	const topic = $derived(data.topic);
	const html = $derived(data.html);

	// Track this topic as current on load
	$effect(() => {
		progress.setCurrentTopic(topic.slug);
	});

	// Find prev/next in the learning path
	const allSlugs = learningPath.flatMap((s) => s.topics);
	const currentIdx = $derived(allSlugs.indexOf(topic.slug));
	const prevSlug = $derived(currentIdx > 0 ? allSlugs[currentIdx - 1] : null);
	const nextSlug = $derived(currentIdx < allSlugs.length - 1 ? allSlugs[currentIdx + 1] : null);

	const sectionLabel: Record<string, string> = {
		typescript: 'TypeScript',
		svelte5: 'Svelte 5',
		architecture: 'Architecture',
		patterns: 'Patterns'
	};

	const copySummaryText = $derived(
		`# ${topic.title}\n\n${topic.summary}\n\n${topic.repoFiles?.map((f) => `- ${f}`).join('\n') ?? ''}`
	);
</script>

<svelte:head>
	<title>{topic.title} — TableRelay Handbook</title>
	<meta name="description" content={topic.summary} />
</svelte:head>

<article class="topic-page">
	<div class="topic-meta">
		<a href="/topics" class="back-link">← Topics</a>
		<span class="section-badge">{sectionLabel[topic.section] ?? topic.section}</span>
	</div>

	<header class="topic-header">
		<h1 class="topic-title">{topic.title}</h1>
		<p class="topic-summary">{topic.summary}</p>

		<div class="topic-actions">
			<ProgressBadge
				status={progress.getStatus(topic.slug)}
				interactive
				onchange={(s: ProgressStatus) => progress.setStatus(topic.slug, s)}
			/>
			<CopyButton text={copySummaryText} label="Copy summary" />
		</div>

		<div class="topic-tags">
			{#each topic.tags as tag}
				<span class="tag">{tag}</span>
			{/each}
		</div>
	</header>

	<div class="prose topic-body">
		{@html html}
	</div>

	{#if topic.repoFiles?.length || topic.repoDirs?.length}
		<RepoLinks files={topic.repoFiles} dirs={topic.repoDirs} />
	{/if}

	{#if topic.sources?.length}
		<SourceBlock sources={topic.sources} />
	{/if}

	<nav class="topic-nav">
		{#if prevSlug}
			<a href="/topics/{prevSlug}" class="nav-btn prev">← Previous</a>
		{:else}
			<span></span>
		{/if}
		{#if nextSlug}
			<a href="/topics/{nextSlug}" class="nav-btn next">Next →</a>
		{/if}
	</nav>
</article>

<style>
	.topic-page {
		max-width: var(--content-max);
	}

	.topic-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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

	.section-badge {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.2em 0.6em;
		border-radius: 999px;
		background: var(--bg-card);
		color: var(--text-muted);
		border: 1px solid var(--border);
	}

	.topic-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.topic-title {
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
		margin-bottom: 0.5rem;
	}

	.topic-summary {
		color: var(--text-muted);
		font-size: 1rem;
		margin-bottom: 1rem;
	}

	.topic-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.topic-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.topic-body {
		margin-bottom: 2rem;
	}

	.topic-nav {
		display: flex;
		justify-content: space-between;
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.nav-btn {
		font-size: 0.85rem;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-surface);
		transition: background 0.15s, color 0.15s;
	}

	.nav-btn:hover {
		background: var(--bg-hover);
		color: var(--text);
		text-decoration: none;
	}
</style>
