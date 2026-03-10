<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';

	let { children } = $props();

	let sidebarOpen = $state(false);

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = sidebarOpen ? 'hidden' : '';
		}
	});
</script>

<div class="app-shell">
	<MobileNav
		open={sidebarOpen}
		onopen={() => (sidebarOpen = true)}
		onclose={() => (sidebarOpen = false)}
	/>

	<Sidebar open={sidebarOpen} onclose={() => (sidebarOpen = false)} />

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		margin-left: var(--sidebar-width);
		padding: var(--content-pad);
		max-width: calc(var(--sidebar-width) + var(--content-max) + var(--content-pad) * 2);
		min-width: 0;
	}

	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			padding: 1.25rem 1rem;
		}
	}
</style>
