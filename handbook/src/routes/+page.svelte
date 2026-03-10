<script lang="ts">
	import { learningPath, sectionColours } from '$lib/content/learning-path';
	import { allTopics } from '$lib/content/topics';
	import { progress } from '$lib/stores/progress.svelte';

	const totalTopics = allTopics.length;
	const solidCount = $derived(
		Object.values(progress.topics).filter((s) => s === 'solid').length
	);
	const inProgressCount = $derived(
		Object.values(progress.topics).filter((s) => s === 'in-progress' || s === 'reviewed').length
	);
</script>

<svelte:head>
	<title>TableRelay Handbook</title>
</svelte:head>

<div class="home">
	<header class="home-header">
		<h1 class="home-title">
			<span class="accent">Table</span>Relay Handbook
		</h1>
		<p class="home-subtitle">
			Learning &amp; reference guide for the OVERLAYS / TableRelay codebase.
		</p>
	</header>

	<div class="progress-strip">
		<div class="progress-stat">
			<span class="stat-num">{solidCount}</span>
			<span class="stat-label">solid</span>
		</div>
		<div class="progress-stat">
			<span class="stat-num">{inProgressCount}</span>
			<span class="stat-label">in progress</span>
		</div>
		<div class="progress-stat">
			<span class="stat-num">{totalTopics}</span>
			<span class="stat-label">total topics</span>
		</div>
	</div>

	<section class="path-section">
		<h2 class="section-heading">Learning Path</h2>
		<div class="path-grid">
			{#each learningPath as section, i}
				<a href="/learning-path#{section.id}" class="path-card">
					<div class="path-num" style:color={sectionColours[section.id]}>0{i + 1}</div>
					<div>
						<div class="path-title">{section.title}</div>
						<div class="path-desc">{section.description}</div>
						<div class="path-topics">{section.topics.length} topics</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="quick-links">
		<h2 class="section-heading">Sections</h2>
		<div class="links-grid">
			<a href="/topics" class="link-card">
				<span class="link-icon">◈</span>
				<span class="link-label">Topics</span>
				<span class="link-desc">All {totalTopics} handbook topics</span>
			</a>
			<a href="/repo-map" class="link-card">
				<span class="link-icon">⌗</span>
				<span class="link-label">Repo Map</span>
				<span class="link-desc">Key files and directories</span>
			</a>
			<a href="/arch" class="link-card">
				<span class="link-icon">⬡</span>
				<span class="link-label">Architecture</span>
				<span class="link-desc">Decisions and trade-offs</span>
			</a>
			<a href="/patterns" class="link-card">
				<span class="link-icon">◇</span>
				<span class="link-label">Patterns</span>
				<span class="link-desc">Glossary and patterns</span>
			</a>
			<a href="/sessions" class="link-card">
				<span class="link-icon">◷</span>
				<span class="link-label">Study Sessions</span>
				<span class="link-desc">Track your progress</span>
			</a>
			<a href="/context-packs" class="link-card">
				<span class="link-icon">⧉</span>
				<span class="link-label">Context Packs</span>
				<span class="link-desc">LLM-ready topic bundles</span>
			</a>
		</div>
	</section>
</div>

<style>
	.home {
		max-width: var(--content-max);
	}

	.home-header {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border);
	}

	.home-title {
		font-size: 2.25rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		color: var(--text);
		margin-bottom: 0.5rem;
	}

	.accent {
		color: var(--cyan);
	}

	.home-subtitle {
		color: var(--text-muted);
		font-size: 1.05rem;
	}

	.progress-strip {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}

	.progress-stat {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.stat-num {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--cyan);
		font-variant-numeric: tabular-nums;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.section-heading {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-dim);
		margin-bottom: 1rem;
	}

	.path-section {
		margin-bottom: 2.5rem;
	}

	.path-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.path-card {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		padding: 1.1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.path-card:hover {
		background: var(--bg-hover);
		border-color: var(--text-dim);
		text-decoration: none;
	}

	.path-num {
		font-size: 1.4rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		flex-shrink: 0;
		padding-top: 0.1rem;
	}

	.path-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 0.25rem;
	}

	.path-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.4;
		margin-bottom: 0.4rem;
	}

	.path-topics {
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.link-card {
		display: grid;
		grid-template-rows: auto auto 1fr;
		gap: 0.2rem;
		padding: 1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.link-card:hover {
		background: var(--bg-hover);
		border-color: var(--text-dim);
		text-decoration: none;
	}

	.link-icon {
		font-size: 1.1rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.link-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text);
	}

	.link-desc {
		font-size: 0.75rem;
		color: var(--text-dim);
	}
</style>
