<script lang="ts">
	import { progress } from '$lib/stores/progress.svelte';
	import ProgressBadge from '$lib/components/ProgressBadge.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Topics — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Topics</h1>
	<p class="page-subtitle">{data.total} topics across {data.sections.length} sections.</p>
</div>

{#each data.sections as section}
	<section class="topic-section">
		<h2 class="section-label topic-section-label">{section.label}</h2>
		<div class="topic-grid">
			{#each section.topics as topic}
				<a href="/topics/{topic.slug}" class="topic-card">
					<div class="topic-card-top">
						<span class="topic-title">{topic.title}</span>
						<ProgressBadge status={progress.getStatus(topic.slug)} />
					</div>
					<p class="topic-summary">{topic.summary}</p>
					<div class="topic-tags">
						{#each topic.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</a>
			{/each}
		</div>
	</section>
{/each}

<style>
	.topic-section {
		margin-bottom: 2.5rem;
	}

	.topic-section-label {
		margin-bottom: 0.75rem;
	}

	.topic-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 0.75rem;
	}

	.topic-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.topic-card:hover {
		background: var(--bg-hover);
		border-color: var(--text-dim);
		text-decoration: none;
	}

	.topic-card-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.topic-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}

	.topic-summary {
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	.topic-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: 0.25rem;
	}
</style>
