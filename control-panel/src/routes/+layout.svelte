<!--
  Root layout: shared app shell, header, and sidebar navigation.
-->
<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Dialog } from 'bits-ui';
	import { fade, fly } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import { socketStatus, connectSocket, socket } from '$lib/services/socket.svelte';
	import { onMount } from 'svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	let isSidebarOpen = $state(false);
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
		{ href: '/live', label: 'Mesa de producción', active: page.url.pathname.startsWith('/stage') },
	]);
	onMount(() => {
    connectSocket("session-testing", "stage");
		console.debug('[Layout] Socket status on mount:', socketStatus.connected ? 'connected' : 'disconnected');
    if (socketStatus.lastSync) {
      console.debug('[Layout] Last sync time on mount:', socketStatus.lastSync.toLocaleTimeString());
    }
	});
</script>

<div class="app-shell">
	<a class="skip-to-content" href="#main-content">Saltar al contenido</a>

	<header class="app-header">
		<div style="gap:0;" class="brand-wordmark">
			<span class="brand-block">table</span>
			<span class="brand-block" style="text-transform: capitalize;">Relay</span>
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
			{#each navLinks as link}
				<a
					class="desktop-nav-link"
					class:active={link.active}
					href={resolve(link.href, {})}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="header-meta">
			<div class="header-status" title={socketStatus.connected ? 'Conectado' : 'Desconectado'}>
				<div class="conn-dot" class:connected={socketStatus.connected}></div>
			</div>
			
			<Dialog.Root bind:open={isSidebarOpen}>
				<Dialog.Trigger class="header-menu" aria-label="Abrir navegación">☰</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Overlay
						transition={fade}
						transitionConfig={{ duration: 200 }}
						class="sidebar-backdrop"
					/>

					<Dialog.Content
						transition={fly}
						transitionConfig={{ x: -320, duration: 300, opacity: 1 }}
						class="app-sidebar open"
					>
						<div class="app-sidebar-head">
							<Dialog.Title class="app-sidebar-title">NAVEGACIÓN</Dialog.Title>
							<Dialog.Close class="app-sidebar-close" aria-label="Cerrar navegación">
								✕
							</Dialog.Close>
						</div>

						<nav class="app-sidebar-nav">
							{#each navLinks as link}
								<a
									class="app-sidebar-link"
									class:active={link.active}
									href={resolve(link.href, {})}
									onclick={() => (isSidebarOpen = false)}
								>
									{link.label.toUpperCase()}
								</a>
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
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	</header>

	<main class="app-main" id="main-content">
		{@render children()}
	</main>
</div>

<style>
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
			display: none;
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
