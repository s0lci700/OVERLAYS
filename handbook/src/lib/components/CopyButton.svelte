<script lang="ts">
	interface Props {
		text: string;
		label?: string;
	}

	let { text, label = 'Copy' }: Props = $props();

	let state = $state<'idle' | 'copied' | 'error'>('idle');

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			state = 'copied';
		} catch {
			state = 'error';
		}
		setTimeout(() => (state = 'idle'), 1800);
	}
</script>

<button class="copy-btn" onclick={copy} data-state={state} title="Copy to clipboard">
	{#if state === 'copied'}
		✓ Copied
	{:else if state === 'error'}
		Failed
	{:else}
		{label}
	{/if}
</button>

<style>
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.3em 0.7em;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--bg-surface);
		color: var(--text-muted);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s, background 0.15s;
		white-space: nowrap;
	}

	.copy-btn:hover {
		background: var(--bg-hover);
		color: var(--text);
		border-color: var(--text-dim);
	}

	.copy-btn[data-state='copied'] {
		color: var(--status-solid);
		border-color: var(--status-solid);
	}

	.copy-btn[data-state='error'] {
		color: var(--red);
		border-color: var(--red);
	}
</style>
