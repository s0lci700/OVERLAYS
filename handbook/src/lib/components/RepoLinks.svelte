<script lang="ts">
	import { repoFileUrl, repoDirUrl } from '$lib/config/repo';

	interface Props {
		files?: string[];
		dirs?: string[];
	}

	let { files = [], dirs = [] }: Props = $props();

	let copied = $state<string | null>(null);
	let copyError = $state<string | null>(null);

	async function copyPath(path: string) {
		try {
			await navigator.clipboard.writeText(path);
			copied = path;
			copyError = null;
			setTimeout(() => (copied = null), 1500);
		} catch {
			// Clipboard write failed (non-HTTPS, permission denied, etc.)
			copyError = path;
			setTimeout(() => (copyError = null), 1500);
		}
	}
</script>

{#if files.length > 0 || dirs.length > 0}
	<div class="repo-links">
		<h4 class="repo-heading">Repo References</h4>

		{#if dirs.length > 0}
			<div class="repo-group">
				<span class="repo-kind">Directories</span>
				{#each dirs as dir}
					<div class="repo-entry">
						<a href={repoDirUrl(dir)} target="_blank" rel="noopener noreferrer" class="repo-path">
							📁 {dir}
						</a>
						<button class="copy-btn" onclick={() => copyPath(dir)} title="Copy path"
							class:is-error={copyError === dir}>
							{copied === dir ? '✓' : copyError === dir ? '✕' : '⎘'}
						</button>
					</div>
				{/each}
			</div>
		{/if}

		{#if files.length > 0}
			<div class="repo-group">
				<span class="repo-kind">Files</span>
				{#each files as file}
					<div class="repo-entry">
						<a href={repoFileUrl(file)} target="_blank" rel="noopener noreferrer" class="repo-path">
							📄 {file}
						</a>
						<button class="copy-btn" onclick={() => copyPath(file)} title="Copy path"
							class:is-error={copyError === file}>
							{copied === file ? '✓' : copyError === file ? '✕' : '⎘'}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.repo-links {
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		border-left: 3px solid var(--purple);
	}

	.repo-heading {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-dim);
		margin-bottom: 0.75rem;
	}

	.repo-group {
		margin-bottom: 0.75rem;
	}

	.repo-group:last-child {
		margin-bottom: 0;
	}

	.repo-kind {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-dim);
		display: block;
		margin-bottom: 0.35rem;
	}

	.repo-entry {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.repo-path {
		font-family: monospace;
		font-size: 0.8rem;
		color: var(--purple);
		text-decoration: none;
		word-break: break-all;
	}

	.repo-path:hover {
		text-decoration: underline;
	}

	.copy-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-dim);
		font-size: 0.75rem;
		padding: 0.1rem 0.3rem;
		border-radius: var(--radius-sm);
		transition: color 0.1s;
		flex-shrink: 0;
	}

	.copy-btn:hover {
		color: var(--text-muted);
	}

	.copy-btn.is-error {
		color: var(--red, #f87171);
	}
</style>
