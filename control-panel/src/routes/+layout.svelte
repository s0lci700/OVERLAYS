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
	// import { socket } from "$lib/services/socket";
	import { onMount } from 'svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	let connected = $state(socketStatus.connected);
	let isSidebarOpen = $state(false);
	let charCount = $derived(data.charCount ?? 0);

	let isOverview = $derived(page.url.pathname.startsWith('/overview'));
	let isSetup = $derived(page.url.pathname.startsWith('/setup'));
	let isDM = $derived(page.url.pathname.startsWith('/dm'));
	let isPlayers = $derived(page.url.pathname.startsWith('/players'));

	const navLinks = $derived([
		{ href: '/setup/create', label: 'Gestión de personajes', active: isSetup },
		{ href: '/overview', label: 'Dashboard', active: isOverview },
		{ href: '/dm', label: 'Panel DM', active: isDM },
		{ href: '/players', label: 'Ficha Jugador', active: isPlayers }
	]);
	onMount(() => {
    connectSocket("session-testing", "stage");
		console.log('Socket status on mount:', socketStatus.connected ? 'connected' : 'disconnected');  
    if (socketStatus.lastSync) {
      console.log('Last sync time on mount:', socketStatus.lastSync.toLocaleTimeString());
    }
	});
</script>

<div class="app-shell">
	<a class="skip-to-content" href="#main-content">Saltar al contenido</a>

	<header class="app-header">
		<div class="brand-wordmark">
			<span class="brand-block">table</span>
			<span class="brand-script">Relay</span>
		</div>

		<span class="page-title">
			{isOverview
				? 'DASHBOARD EN VIVO'
				: isSetup
					? 'GESTIÓN DE PERSONAJES'
					: isDM
						? 'PANEL DM'
						: isPlayers
							? 'FICHA DE PERSONAJE'
							: 'PANEL DE CONTROL'}
		</span>

		<div class="header-meta">
			<div class="conn-dot" class:connected={socketStatus.connected}></div>
			<span class="header-count">{charCount}</span>
			
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
							{#if socketStatus.lastSync}
								<div class="sidebar-sync">
									Sincronizado: {socketStatus.lastSync.toLocaleTimeString()}
								</div>
							{/if}
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
	}
</style>
