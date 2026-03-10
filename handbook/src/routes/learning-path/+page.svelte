<script lang="ts">
	import { learningPath, sectionColours } from '$lib/content/learning-path';
	import { allTopics } from '$lib/content/topics';
	import { progress } from '$lib/stores/progress.svelte';
	import ProgressBadge from '$lib/components/ProgressBadge.svelte';

	function getTopic(slug: string) {
		return allTopics.find((t) => t.slug === slug);
	}
</script>

<svelte:head>
	<title>Learning Path — TableRelay Handbook</title>
</svelte:head>

<div class="page-header">
	<h1 class="page-title">Learning Path</h1>
	<p class="page-subtitle">
		A guided progression from TypeScript basics to OVERLAYS-specific patterns.
	</p>
</div>

<div class="path">
	{#each learningPath as section, i}
		<section class="path-section" id={section.id}>
			<div class="section-head">
				<div class="section-num" style:color={sectionColours[section.id]}>
					0{i + 1}
				</div>
				<div>
					<h2 class="section-title">{section.title}</h2>
					<p class="section-desc">{section.description}</p>
				</div>
			</div>

			<div class="topic-list">
				{#each section.topics as slug}
					{@const topic = getTopic(slug)}
					{#if topic}
						<a href="/topics/{slug}" class="topic-row">
							<div class="topic-info">
								<span class="topic-title">{topic.title}</span>
								<span class="topic-summary">{topic.summary}</span>
							</div>
							<ProgressBadge status={progress.getStatus(slug)} />
						</a>
					{/if}
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.path {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		max-width: var(--content-max);
	}

	.path-section {
		border-left: 2px solid var(--border);
		padding-left: 1.5rem;
	}

	.section-head {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.section-num {
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
		flex-shrink: 0;
	}

	.section-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 0.25rem;
	}

	.section-desc {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.topic-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.topic-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		transition: background 0.15s, border-color 0.15s;
	}

	.topic-row:hover {
		background: var(--bg-hover);
		border-color: var(--text-dim);
		text-decoration: none;
	}

	.topic-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.topic-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.topic-summary {
		font-size: 0.775rem;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
