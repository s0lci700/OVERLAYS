<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LayoutData } from './$types';
	import './cast-layer.css';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const character = $derived(data.character);

	const navBase = $derived(character ? `/players/${character.id}` : '/players');

	const activeTab = $derived(
		page.url.pathname.endsWith('/skills')
			? 'skills'
			: page.url.pathname.endsWith('/magic')
				? 'magic'
				: page.url.pathname.endsWith('/notes')
					? 'notes'
					: 'home'
	);

	const hpPercent = $derived(
		character ? Math.round((character.hp_current / character.hp_max) * 100) : 0
	);

	const isCritical = $derived(hpPercent <= 25);

	function formatHp(c: NonNullable<typeof character>) {
		return `${c.hp_current}/${c.hp_max}`;
	}

	function formatSubtitle(c: NonNullable<typeof character>) {
		const parts = [`LVL ${c.level}`, c.species.toUpperCase(), c.class_name.toUpperCase()];
		if (c.subclass_name) parts.push(c.subclass_name.toUpperCase());
		return parts.join(' ');
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=JetBrains+Mono:wght@700&family=Noto+Serif:wght@600&family=Space+Grotesk:wght@500;700&display=swap"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
	/>
</svelte:head>

<div class="cast-shell">
	{#if character}
		<!-- ── Fixed Header ─────────────────────────────────────────── -->
		<header class="cast-header-bar">
			<div class="cast-header-inner">
				<div class="cast-header-identity">
					<h1 class="cast-name">{character.name}</h1>
					<p class="cast-subtitle">{formatSubtitle(character)}</p>
				</div>
				<div class="cast-header-vitals">
					<span class="cast-vitals-hp {isCritical ? 'cast-vitals-hp--critical' : ''}">
						HP {formatHp(character)}
					</span>
					<span class="cast-vitals-sep">|</span>
					<span class="cast-vitals-ac">AC {character.ac_base}</span>
				</div>
			</div>
		</header>

		<!-- ── Page Content ─────────────────────────────────────────── -->
		<main class="cast-main">
			{@render children()}
		</main>

		<!-- ── Fixed Bottom Nav ─────────────────────────────────────── -->
		<nav class="cast-nav-bar">
			<a
				href={resolve(navBase, {})}
				class="cast-nav-tab {activeTab === 'home' ? 'cast-nav-tab--active' : ''}"
				aria-current={activeTab === 'home' ? 'page' : undefined}
			>
				<span class="material-symbols-outlined cast-nav-icon"
					aria-hidden="true"
					style={activeTab === 'home' ? 'font-variation-settings: "FILL" 1' : ''}>home</span>
				<span class="cast-nav-label">HOME</span>
			</a>
			<a
				href={resolve(`${navBase}/skills`, {})}
				class="cast-nav-tab {activeTab === 'skills' ? 'cast-nav-tab--active' : ''}"
				aria-current={activeTab === 'skills' ? 'page' : undefined}
			>
				<span class="material-symbols-outlined cast-nav-icon"
					aria-hidden="true"
					style={activeTab === 'skills' ? 'font-variation-settings: "FILL" 1' : ''}>military_tech</span>
				<span class="cast-nav-label">SKILLS</span>
			</a>
			<a
				href={resolve(`${navBase}/magic`, {})}
				class="cast-nav-tab {activeTab === 'magic' ? 'cast-nav-tab--active' : ''}"
				aria-current={activeTab === 'magic' ? 'page' : undefined}
			>
				<span class="material-symbols-outlined cast-nav-icon"
					aria-hidden="true"
					style={activeTab === 'magic' ? 'font-variation-settings: "FILL" 1' : ''}>auto_stories</span>
				<span class="cast-nav-label">MAGIC</span>
			</a>
			<a
				href={resolve(`${navBase}/notes`, {})}
				class="cast-nav-tab {activeTab === 'notes' ? 'cast-nav-tab--active' : ''}"
				aria-current={activeTab === 'notes' ? 'page' : undefined}
			>
				<span class="material-symbols-outlined cast-nav-icon"
					aria-hidden="true"
					style={activeTab === 'notes' ? 'font-variation-settings: "FILL" 1' : ''}>edit_note</span>
				<span class="cast-nav-label">NOTES</span>
			</a>
		</nav>
	{:else}
		<main class="cast-main cast-main--bare">
			{@render children()}
		</main>
	{/if}
</div>

<style>
	/* ── Shell ──────────────────────────────────────────────────── */
	.cast-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background-color: var(--cast-bg);
		color: var(--cast-text-primary);
		font-family: var(--cast-font-chrome);
	}

	/* ── Header ─────────────────────────────────────────────────── */
	.cast-header-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		height: var(--cast-header-height);
		background-color: var(--cast-header-bg);
		backdrop-filter: blur(var(--cast-blur));
		border-bottom: 1px solid var(--cast-border-light);
	}

	.cast-header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		padding: 0 1rem;
		gap: 0.75rem;
	}

	.cast-header-identity {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.cast-name {
		font-family: var(--cast-font-data);
		font-weight: 700;
		font-size: 1.125rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--cast-text-primary);
		line-height: 1;
		margin: 0;
	}

	.cast-subtitle {
		font-family: var(--cast-font-chrome);
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--cast-amber);
		line-height: 1.2;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cast-header-vitals {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 0.375rem;
		font-family: var(--cast-font-data);
		font-weight: 700;
		font-size: 0.875rem;
		letter-spacing: 0.05em;
		color: var(--cast-cyan);
	}

	.cast-vitals-sep {
		color: rgba(0, 229, 255, 0.3);
	}

	.cast-vitals-hp--critical {
		animation: cast-hp-critical 2s ease-in-out infinite;
	}

	/* ── Main ───────────────────────────────────────────────────── */
	.cast-main {
		flex: 1;
		padding-top: var(--cast-header-height);
		padding-bottom: var(--cast-nav-height);
		overflow-x: hidden;
	}

	.cast-main--bare {
		padding-top: 0;
		padding-bottom: 0;
	}

	/* ── Nav ────────────────────────────────────────────────────── */
	.cast-nav-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		height: var(--cast-nav-height);
		background-color: var(--cast-nav-bg);
		backdrop-filter: blur(var(--cast-blur));
		border-top: 1px solid var(--cast-border-light);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}

	.cast-nav-tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		color: rgba(240, 240, 240, 0.6);
		text-decoration: none;
		transition: all var(--cast-t-press);
		border-top: 2px solid transparent;
		-webkit-tap-highlight-color: transparent;
	}

	.cast-nav-tab:hover {
		color: var(--cast-amber);
	}

	.cast-nav-tab:active {
		transform: scale(0.95);
	}

	.cast-nav-tab--active {
		color: var(--cast-amber);
		border-top-color: var(--cast-amber);
		background-color: rgba(200, 148, 74, 0.05);
		box-shadow: var(--cast-active-shadow);
	}

	.cast-nav-icon {
		font-size: 22px;
		line-height: 1;
	}

	.cast-nav-label {
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		line-height: 1;
	}
</style>
