<script lang="ts">
	interface Props {
		open?: boolean;
		onopen?: () => void;
		onclose?: () => void;
	}

	let { open = false, onopen, onclose }: Props = $props();

	function toggle() {
		if (open) onclose?.();
		else onopen?.();
	}
</script>

<header class="mobile-nav">
	<button class="menu-btn" onclick={toggle} aria-label={open ? 'Close menu' : 'Open menu'}>
		<span class="burger" class:open>
			<span></span><span></span><span></span>
		</span>
	</button>

	<a href="/" class="wordmark">
		<span class="wordmark-accent">Table</span>Relay <span class="wordmark-sub">Handbook</span>
	</a>
</header>

<style>
	.mobile-nav {
		display: none;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--sidebar-bg);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 30;
	}

	.menu-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.burger {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 20px;
	}

	.burger span {
		display: block;
		height: 2px;
		background: var(--text-muted);
		border-radius: 2px;
		transition: transform 0.2s, opacity 0.2s;
	}

	.burger.open span:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}
	.burger.open span:nth-child(2) {
		opacity: 0;
	}
	.burger.open span:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	.wordmark {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		letter-spacing: -0.02em;
	}

	.wordmark-accent {
		color: var(--cyan);
	}

	.wordmark-sub {
		font-size: 0.7rem;
		font-weight: 400;
		color: var(--text-dim);
		margin-left: 0.15rem;
	}

	@media (max-width: 768px) {
		.mobile-nav {
			display: flex;
		}
	}
</style>
