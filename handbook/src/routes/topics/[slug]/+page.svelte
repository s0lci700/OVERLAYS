<script lang="ts">
	import { learningPath } from '$lib/content/learning-path';
	import { allTopics } from '$lib/content/topics';
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
		[
			`# ${topic.title}`,
			`Section: ${sectionLabel[topic.section] ?? topic.section} | Tags: ${topic.tags.join(', ')}`,
			'',
			topic.summary,
			topic.repoFiles?.length
				? '\n## Key files\n' + topic.repoFiles.map((f) => `- ${f}`).join('\n')
				: ''
		]
			.join('\n')
			.trim()
	);

	const relatedTopics = $derived.by(() => {
		if (!topic.related?.length) return [];
		return topic.related
			.map((slug) => allTopics.find((t) => t.slug === slug))
			.filter((t): t is NonNullable<typeof t> => t != null);
	});

	const confusedTopics = $derived.by(() => {
		if (!topic.confusedWith?.length) return [];
		return topic.confusedWith.flatMap(({ slug, distinction }) => {
			const t = allTopics.find((t) => t.slug === slug);
			return t ? [{ ...t, distinction }] : [];
		});
	});

	const nextTopic = $derived(
		nextSlug ? (allTopics.find((t) => t.slug === nextSlug) ?? null) : null
	);
</script>

<svelte:head>
	<title>{topic.title} — TableRelay Handbook</title>
	<meta name="description" content={topic.summary} />
	<meta property="og:title" content="{topic.title} — TableRelay Handbook" />
	<meta property="og:description" content={topic.summary} />
	<meta property="og:type" content="article" />
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

	{#if topic.recall?.length}
		<section class="recall-prompts">
			<h3 class="recall-heading">Test yourself</h3>
			<ol class="recall-list">
				{#each topic.recall as question}
					<li class="recall-item">{question}</li>
				{/each}
			</ol>
		</section>
	{/if}

	{#if confusedTopics.length}
		<section class="confused-with">
			<h3 class="confused-heading">Often confused with</h3>
			<ul class="confused-list">
				{#each confusedTopics as ct}
					<li>
						<a href="/topics/{ct.slug}" class="confused-link">
							<span class="confused-title">{ct.title}</span>
							<span class="confused-distinction">{ct.distinction}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if relatedTopics.length}
		<section class="related-topics">
			<h3 class="related-heading">Related topics</h3>
			<ul class="related-list">
				{#each relatedTopics as rel}
					<li>
						<a href="/topics/{rel.slug}" class="related-link">
							<span class="related-title">{rel.title}</span>
							<span class="related-summary">{rel.summary}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if nextTopic}
		<div class="up-next">
			<span class="up-next-label">Up next</span>
			<a href="/topics/{nextTopic.slug}" class="up-next-card">
				<span class="up-next-title">{nextTopic.title}</span>
				<span class="up-next-summary">{nextTopic.summary}</span>
			</a>
		</div>
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
		flex-wrap: wrap;
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

	/* ── Recall prompts ─────────────────────────────────────────────────── */

	.recall-prompts {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.recall-heading {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
	}

	.recall-list {
		margin: 0;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.recall-item {
		font-size: 0.875rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	/* ── Confused with ───────────────────────────────────────────────────── */

	.confused-with {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.confused-heading {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
	}

	.confused-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.confused-link {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		border-left: 2px solid var(--text-dim);
		border-radius: var(--radius);
		background: var(--bg-surface);
		text-decoration: none;
		transition: background 0.15s, border-color 0.15s;
	}

	.confused-link:hover {
		background: var(--bg-hover);
		border-left-color: var(--text-muted);
		text-decoration: none;
	}

	.confused-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text);
	}

	.confused-distinction {
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.45;
	}

	/* ── Up next ─────────────────────────────────────────────────────────── */

	.up-next {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.up-next-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
	}

	.up-next-card {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--bg-surface);
		text-decoration: none;
		transition: background 0.15s, border-color 0.15s;
	}

	.up-next-card:hover {
		background: var(--bg-hover);
		border-color: var(--cyan);
		text-decoration: none;
	}

	.up-next-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--cyan);
	}

	.up-next-summary {
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	/* ── Related topics ──────────────────────────────────────────────────── */

	.related-topics {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.related-heading {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
	}

	.related-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.related-link {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-surface);
		text-decoration: none;
		transition: background 0.15s, border-color 0.15s;
	}

	.related-link:hover {
		background: var(--bg-hover);
		border-color: var(--cyan);
		text-decoration: none;
	}

	.related-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--cyan);
	}

	.related-summary {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.topic-title {
			font-size: 1.4rem;
		}

		.topic-summary {
			font-size: 0.95rem;
		}
	}
</style>
