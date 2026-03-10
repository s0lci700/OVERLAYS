<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		open?: boolean;
		onclose?: () => void;
	}

	let { open = false, onclose }: Props = $props();

	const nav = [
		{ href: '/', label: 'Home', icon: '⌂' },
		{ href: '/learning-path', label: 'Learning Path', icon: '→' },
		{ href: '/topics', label: 'Topics', icon: '◈' },
		{ href: '/repo-map', label: 'Repo Map', icon: '⌗' },
		{ href: '/arch', label: 'Architecture', icon: '⬡' },
		{ href: '/patterns', label: 'Patterns & Glossary', icon: '◇' },
		{ href: '/sessions', label: 'Study Sessions', icon: '◷' },
		{ href: '/context-packs', label: 'Context Packs', icon: '⧉' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}
</script>

<!-- Mobile overlay backdrop -->
{#if open}
	<div class="backdrop" onclick={onclose} aria-hidden="true"></div>
{/if}

<aside class="sidebar" class:open>
	<div class="sidebar-header">
		<a href="/" class="wordmark" onclick={onclose}>
			<span class="wordmark-accent">Table</span>Relay
		</a>
		<span class="wordmark-sub">Handbook</span>
	</div>

	<nav class="sidebar-nav">
		{#each nav as item}
			<a
				href={item.href}
				class="nav-link"
				class:active={isActive(item.href)}
				onclick={onclose}
			>
				<span class="nav-icon" aria-hidden="true">{item.icon}</span>
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<a href="/api/topics" class="api-link" target="_blank">
			API: topics.json ↗
		</a>
	</div>
</aside>

<style>
	.backdrop {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 40;
	}

	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: var(--sidebar-width);
		background: var(--sidebar-bg);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		z-index: 50;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 1.5rem 1.25rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.wordmark {
		display: block;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		letter-spacing: -0.02em;
	}

	.wordmark-accent {
		color: var(--cyan);
	}

	.wordmark-sub {
		display: block;
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-dim);
		margin-top: 0.1rem;
	}

	.sidebar-nav {
		flex: 1;
		padding: 0.75rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: background 0.1s, color 0.1s;
	}

	.nav-link:hover {
		background: var(--bg-hover);
		color: var(--text);
		text-decoration: none;
	}

	.nav-link.active {
		background: var(--bg-hover);
		color: var(--cyan);
	}

	.nav-icon {
		font-size: 0.8rem;
		width: 1.1rem;
		text-align: center;
		opacity: 0.7;
	}

	.sidebar-footer {
		padding: 0.75rem 1.25rem 1.25rem;
		border-top: 1px solid var(--border-subtle);
	}

	.api-link {
		font-size: 0.7rem;
		color: var(--text-dim);
		text-decoration: none;
		font-family: monospace;
	}

	.api-link:hover {
		color: var(--text-muted);
		text-decoration: underline;
	}

	/* Mobile: hidden by default, shown when .open */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
			transition: transform 0.25s ease;
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.backdrop {
			display: block;
		}
	}
</style>
