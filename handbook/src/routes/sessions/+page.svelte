<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';
	import { allTopics } from '$lib/content/topics';
	import { learningPath } from '$lib/content/learning-path';
	import ProgressBadge from '$lib/components/ProgressBadge.svelte';
	import type { ProgressStatus } from '$lib/types/content';

	const statuses: ProgressStatus[] = ['not-started', 'in-progress', 'reviewed', 'solid'];

	function countByStatus(s: ProgressStatus) {
		return allTopics.filter((t) => progress.getStatus(t.slug) === s).length;
	}

	// All topics with their progress, in learning path order
	const orderedSlugs = learningPath.flatMap((s) => s.topics);
	const orderedTopics = $derived(
		orderedSlugs
			.map((slug) => allTopics.find((t) => t.slug === slug))
			.filter(Boolean) as typeof allTopics
	);

	function resetAll() {
		if (!confirm('Reset all progress? This cannot be undone.')) return;
		progress.reset();
	}
</script>

<svelte:head>
	<title>Study Sessions — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Study Sessions</h1>
	<p class="page-subtitle">Track your progress through the handbook. Stored locally in your browser.</p>
</div>

<div class="stats-row">
	{#each statuses as s}
		<div class="stat-card" data-status={s}>
			<span class="stat-num">{countByStatus(s)}</span>
			<ProgressBadge status={s} />
		</div>
	{/each}
</div>

{#if progress.lastStudied}
	<div class="last-studied">
		Last studied:
		<a href="/topics/{progress.lastStudied}" class="last-link">{progress.lastStudied}</a>
	</div>
{/if}

<section class="progress-table-section">
	<h2 class="section-label" style="margin-bottom: 0.75rem">All Topics</h2>
	<div class="topic-table">
		{#each orderedTopics as topic}
			<div class="table-row" class:current={progress.currentTopic === topic.slug}>
				<a href="/topics/{topic.slug}" class="row-title">{topic.title}</a>
				<ProgressBadge
					status={progress.getStatus(topic.slug)}
					interactive
					onchange={(s: ProgressStatus) => progress.setStatus(topic.slug, s)}
				/>
			</div>
		{/each}
	</div>
</section>

<div class="danger-zone">
	<button class="reset-btn" onclick={resetAll}>Reset all progress</button>
</div>

<style>
	.stats-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 0.9rem 1.25rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.stat-num {
		font-size: 1.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--text);
	}

	.last-studied {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	.last-link {
		font-family: monospace;
		color: var(--cyan);
	}

	.progress-table-section {
		max-width: var(--content-max);
		margin-bottom: 2rem;
	}

	.topic-table {
		display: flex;
		flex-direction: column;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.table-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
		transition: background 0.1s;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row.current {
		background: var(--bg-hover);
	}

	.row-title {
		font-size: 0.85rem;
		color: var(--text);
		text-decoration: none;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-title:hover {
		color: var(--cyan);
		text-decoration: none;
	}

	.danger-zone {
		margin-top: 1.5rem;
	}

	.reset-btn {
		font-size: 0.8rem;
		color: var(--text-dim);
		background: none;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.4rem 0.75rem;
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}

	.reset-btn:hover {
		color: var(--red);
		border-color: var(--red);
	}
</style>
