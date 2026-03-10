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

	const validStatuses = new Set<string>(statusOptions.map((o) => o.value));

	function isProgressStatus(v: string): v is ProgressStatus {
		return validStatuses.has(v);
	}

	const labels: Record<ProgressStatus, string> = {
		'not-started': 'Not started',
		'in-progress': 'In progress',
		reviewed: 'Reviewed',
		solid: 'Solid'
	};
</script>

{#if interactive}
	<label class="badge-select-wrap">
		<span class="sr-only">Progress status</span>
		<select
			class="badge badge-select"
			data-status={status}
			value={status}
			onchange={(e) => {
				const val = e.currentTarget.value;
				if (isProgressStatus(val)) onchange?.(val);
			}}
		>
			{#each statusOptions as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<span class="chevron" aria-hidden="true">▾</span>
	</label>
{:else}
	<span class="badge" data-status={status}>{labels[status]}</span>
{/if}

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.badge-select-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
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

	.badge-select {
		appearance: none;
		-webkit-appearance: none;
		padding-right: 1.4em;
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
		position: absolute;
		right: 0.5em;
		pointer-events: none;
		font-size: 0.6rem;
		opacity: 0.7;
	}
</style>
