<script lang="ts">
	import type { ProgressStatus } from '$lib/types/content';

	interface Props {
		status: ProgressStatus;
		interactive?: boolean;
		onchange?: (status: ProgressStatus) => void;
	}

	let { status, interactive = false, onchange }: Props = $props();

	const statusOptions: { value: ProgressStatus; label: string }[] = [
		{ value: 'not-started', label: 'Not started' },
		{ value: 'in-progress', label: 'In progress' },
		{ value: 'reviewed', label: 'Reviewed' },
		{ value: 'solid', label: 'Solid' }
	];

	const labels: Record<ProgressStatus, string> = {
		'not-started': 'Not started',
		'in-progress': 'In progress',
		reviewed: 'Reviewed',
		solid: 'Solid'
	};

	let showMenu = $state(false);

	function select(s: ProgressStatus) {
		onchange?.(s);
		showMenu = false;
	}
</script>

{#if interactive}
	<div class="badge-wrap">
		<button
			class="badge"
			data-status={status}
			onclick={() => (showMenu = !showMenu)}
			aria-haspopup="listbox"
			aria-expanded={showMenu}
		>
			{labels[status]}
			<span class="chevron">▾</span>
		</button>
		{#if showMenu}
			<ul class="badge-menu" role="listbox">
				{#each statusOptions as opt}
					<li>
						<button
							class="menu-opt"
							data-status={opt.value}
							class:current={opt.value === status}
							onclick={() => select(opt.value)}
							role="option"
							aria-selected={opt.value === status}
						>
							{opt.label}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{:else}
	<span class="badge" data-status={status}>{labels[status]}</span>
{/if}

<style>
	.badge-wrap {
		position: relative;
		display: inline-block;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.25em 0.65em;
		border-radius: 999px;
		border: 1px solid;
		background: none;
		cursor: pointer;
	}

	button.badge {
		cursor: pointer;
	}

	span.badge {
		cursor: default;
	}

	.badge[data-status='not-started'] {
		color: var(--status-not-started);
		border-color: var(--status-not-started);
	}
	.badge[data-status='in-progress'] {
		color: var(--status-in-progress);
		border-color: var(--status-in-progress);
	}
	.badge[data-status='reviewed'] {
		color: var(--status-reviewed);
		border-color: var(--status-reviewed);
	}
	.badge[data-status='solid'] {
		color: var(--status-solid);
		border-color: var(--status-solid);
	}

	.chevron {
		font-size: 0.6rem;
		opacity: 0.7;
	}

	.badge-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 100;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		list-style: none;
		padding: 0.35rem;
		min-width: 130px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.menu-opt {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.4rem 0.6rem;
		border-radius: var(--radius-sm);
		font-size: 0.8rem;
		color: var(--text-muted);
		transition: background 0.1s, color 0.1s;
	}

	.menu-opt:hover {
		background: var(--bg-hover);
		color: var(--text);
	}

	.menu-opt.current {
		color: var(--cyan);
	}

	.menu-opt[data-status='not-started']:hover { color: var(--status-not-started); }
	.menu-opt[data-status='in-progress']:hover { color: var(--status-in-progress); }
	.menu-opt[data-status='reviewed']:hover { color: var(--status-reviewed); }
	.menu-opt[data-status='solid']:hover { color: var(--status-solid); }
</style>
