<!--
  Root layout: shared app shell, header, and sidebar navigation.
-->
<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LayoutData } from './$types';
	import { socketStatus, connectSocket } from '$lib/services/socket.svelte';
	import { onMount } from 'svelte';
	import { animate, stagger } from 'animejs';
	import type { Action } from 'svelte/action';

	let { children, data }: { children: any; data: LayoutData } = $props();

	let isSidebarOpen = $state(false);
	let sidebarEl: HTMLElement = $state(null);
	let backdropEl: HTMLElement = $state(null);
	let charCount = $derived(data.charCount ?? 0);

	let isOverview = $derived(page.url.pathname.startsWith('/overview'));
	let isSetup = $derived(page.url.pathname.startsWith('/setup'));
	let isDM = $derived(page.url.pathname.startsWith('/dm'));
	let isPlayers = $derived(page.url.pathname.startsWith('/players'));

	const navLinks = $derived([
		{ href: '/setup/create', label: 'Gestión de personajes', active: isSetup },
		{ href: '/overview', label: 'Tablero de control', active: isOverview },
		{ href: '/dm', label: 'Panel del director', active: isDM },
		{ href: '/players', label: 'Ficha de personaje', active: isPlayers },
		{ href: '/live', label: 'Mesa de producción', active: page.url.pathname.startsWith('/live') },
	]);

	/**
	 * Sidebar Enter (Anime.js Action)
	 * Runs once when the sidebar mounts — orchestrates slide-in + staggered links.
	 */
	const sidebarReveal: Action = (node) => {
		node.style.transform = 'translateX(-100%)';
		node.style.opacity = '0';

		const wrappers : NodeListOf<HTMLElement> = node.querySelectorAll('.app-sidebar-link-wrapper');
		wrappers.forEach((w) => ((w as HTMLElement).style.opacity = '0'));

		requestAnimationFrame((): void => {
			animate(node, {
				translateX: ['-100%', 0],
				opacity: [0, 1],
				duration: 500,
				easing: 'easeOutQuart'
			});

			animate(wrappers, {
				translateX: [-24, 0],
				opacity: [0, 1],
				delay: stagger(60, { start: 250 }),
				duration: 450,
				easing: 'easeOutCubic'
			});
		});
	};

	/**
	 * Sidebar Exit — animates out, then unmounts.
	 * Two-phase approach: animate first, set state after.
	 * This avoids the lifecycle conflict of using Svelte out: transitions
	 * inside a portal-managed component (Dialog).
	 */
	async function closeSidebar() {
		const tasks: PromiseLike<unknown>[] = [];

		if (sidebarEl) {
			tasks.push(
				animate(sidebarEl, {
					translateX: [0, '-100%'],
					opacity: [1, 0],
					duration: 350,
					easing: 'easeInQuart'
				})
			);
		}

		if (backdropEl) {
			tasks.push(
				animate(backdropEl, {
					opacity: [1, 0],
					duration: 280,
					easing: 'easeInQuart'
				})
			);
		}

		await Promise.all(tasks);
		isSidebarOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isSidebarOpen) closeSidebar();
	}

	onMount(() => {
		connectSocket('session-testing', 'stage');
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app-shell">
	<a class="skip-to-content" href="#main-content">Saltar al contenido</a>

	<header class="app-header">
		<div class="header-left">
			<button
				class="header-menu"
				aria-label="Abrir navegación"
				aria-expanded={isSidebarOpen}
				onclick={() => (isSidebarOpen = true)}
			>☰</button>

			<div style="gap:0;" class="brand-wordmark" class:sidebar-active={isSidebarOpen}>
				<span class="brand-block">table</span>
				<span class="brand-block" style="text-transform: capitalize;">Relay</span>
			</div>
		</div>

		<!-- This can be refactored in a better way -->
		<span class="page-title">
			{isOverview
				? 'ESTADO DEL GRUPO'
				: isSetup
					? 'GESTIÓN DE PERSONAJES'
					: isDM
						? 'PANEL DEL DIRECTOR'
						: isPlayers
							? 'FICHA DE PERSONAJE'
							: 'MESA DE PRODUCCIÓN'}
		</span>

		<nav class="desktop-nav">
			{#each navLinks as link (link.href)}
				<a class="desktop-nav-link" class:active={link.active} href={resolve(link.href, {})}>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="header-meta">
			<div class="header-status" title={socketStatus.connected ? 'Conectado' : 'Desconectado'}>
				<div class="conn-dot" class:connected={socketStatus.connected}></div>
			</div>
		</div>
	</header>

	{#if isSidebarOpen}
		<div
			class="sidebar-backdrop"
			bind:this={backdropEl}
			role="presentation"
			onclick={closeSidebar}
		></div>

		<div class="app-sidebar" role="dialog" aria-modal="true" aria-label="Navegación">
			<div class="app-sidebar-inner" bind:this={sidebarEl} use:sidebarReveal>
				<div class="app-sidebar-head">
					<span class="app-sidebar-title">NAVEGACIÓN</span>
					<button class="app-sidebar-close" aria-label="Cerrar navegación" onclick={closeSidebar}>
						✕
					</button>
				</div>

				<nav class="app-sidebar-nav">
					{#each navLinks as link (link.href)}
						<div class="app-sidebar-link-wrapper" style="opacity: 0;">
							<a
								class="app-sidebar-link"
								class:active={link.active}
								href={resolve(link.href, {})}
								onclick={closeSidebar}
							>
								{link.label.toUpperCase()}
							</a>
						</div>
					{/each}
				</nav>

				<div class="app-sidebar-footer">
					<div class="sidebar-meta">
						<span class="label-caps">Personajes: {charCount}</span>
						{#if socketStatus.lastSync}
							<div class="sidebar-sync">
								Sincronizado: {socketStatus.lastSync.toLocaleTimeString()}
							</div>
						{/if}
					</div>
					<span class="label-caps">TTRPG Production System v1.0</span>
				</div>
			</div>
		</div>
	{/if}

	<main class="app-main" id="main-content">
		{@render children()}
	</main>
</div>

<style>
	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.brand-wordmark.sidebar-active {
		animation: logo-breathing 3s ease-in-out infinite;
	}

	@keyframes logo-breathing {
		0%,
		100% {
			opacity: 1;
			filter: drop-shadow(0 0 2px var(--cast-amber-glow));
		}
		50% {
			opacity: 0.7;
			filter: drop-shadow(0 0 8px var(--cast-amber-glow));
		}
	}

	.header-status {
		display: flex;
		align-items: center;
		padding: 0 var(--space-2);
		height: 100%;
	}

	.desktop-nav {
		display: none;
		gap: var(--space-2);
		margin: 0 var(--space-4);
		flex: 1;
		justify-content: center;
	}

	.desktop-nav-link {
		font-family: var(--font-display);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: var(--grey);
		text-transform: uppercase;
		transition: all var(--t-fast);
		position: relative;
		padding: var(--space-2) var(--space-4);
		white-space: nowrap;
		border: 1px solid transparent;
	}

	.desktop-nav-link:hover {
		color: var(--white);
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--grey-dim);
	}

	.desktop-nav-link.active {
		color: var(--white);
		background: var(--cast-amber-dim);
		border-color: var(--cast-amber-border);
		box-shadow: inset 0 0 15px var(--cast-amber-glow);
	}

	@media (max-width: 1024px) {
		.desktop-nav {
			display: none;
		}
		.header-menu {
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.page-title {
			display: block;
			font-size: 1.25rem;
			max-width: 200px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	@media (max-width: 480px) {
		.page-title {
			font-size: 1.1rem;
			max-width: 160px;
		}
	}

	.app-sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.app-sidebar-footer {
		margin-top: auto;
		padding-top: var(--space-4);
		border-top: 1px solid var(--cast-amber-border);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.sidebar-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		opacity: 0.8;
	}
</style>
