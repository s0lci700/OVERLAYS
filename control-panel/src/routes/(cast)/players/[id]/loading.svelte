<script lang="ts">
	import { Shimmer } from '@shimmer-from-structure/svelte';
</script>

<div class="home-canvas">
	<!-- ── Identity Hero Skeleton ────────────────────────────────── -->
	<div class="character-hero">
		<div class="hero-portrait-frame">
			<Shimmer width="100%" height="100%" />
		</div>
	</div>

	<!-- ── Stat Strip Skeleton ───────────────────────────────────── -->
	<div class="stat-strip">
		{#each Array(4) as _}
			<div class="stat-cell">
				<Shimmer width="32px" height="24px" class="mb-1" />
				<Shimmer width="40px" height="10px" />
			</div>
		{/each}
	</div>

	<!-- ── Ability Scores Skeleton ───────────────────────────────── -->
	<section class="ability-section">
		<div class="section-header">
			<Shimmer width="120px" height="20px" />
		</div>
		<div class="ability-grid">
			{#each Array(6) as _}
				<div class="ability-cell">
					<Shimmer width="30px" height="10px" class="mb-1" />
					<Shimmer width="40px" height="28px" class="mb-1" />
					<Shimmer width="20px" height="12px" />
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Resources Skeleton ────────────────────────────────────── -->
	<section class="resources-section">
		<div class="section-header">
			<Shimmer width="100px" height="20px" />
		</div>
		<div class="resources-list">
			{#each Array(3) as _}
				<div class="resource-row">
					<div class="resource-info">
						<Shimmer width="80px" height="14px" class="mb-1" />
						<Shimmer width="60px" height="10px" />
					</div>
					<Shimmer width="64px" height="6px" />
					<Shimmer width="40px" height="14px" />
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	/* Styles copied from CharacterSheet.svelte for structural alignment */
	.home-canvas {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 640px;
		margin: 0 auto;
	}

	.character-hero {
		display: flex;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.hero-portrait-frame {
		width: 140px;
		height: 160px;
		background: rgba(27, 27, 35, 0.8);
		backdrop-filter: blur(var(--cast-blur));
		border: 1px solid rgba(200, 148, 74, 0.2);
		clip-path: polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.stat-strip {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		background: rgba(27, 27, 35, 0.6);
		backdrop-filter: blur(var(--cast-blur));
		border: 1px solid var(--cast-border-subtle);
		border-left: 2px solid var(--cast-amber);
	}

	.stat-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 0.5rem;
		gap: 2px;
		border-right: 1px solid var(--cast-border-subtle);
		min-height: 48px;
	}

	.stat-cell:last-child {
		border-right: none;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(200, 148, 74, 0.25);
		padding-bottom: 4px;
		margin-bottom: 1rem;
	}

	.ability-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1px;
		background-color: var(--cast-border-subtle);
	}

	.ability-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 0.5rem;
		gap: 2px;
		background-color: rgba(27, 27, 35, 0.6);
		backdrop-filter: blur(var(--cast-blur));
		min-height: 64px;
	}

	.resources-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.resource-row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 0.75rem;
		background: rgba(27, 27, 35, 0.6);
		backdrop-filter: blur(var(--cast-blur));
		padding: 0.625rem 0.75rem;
		border-left: 2px solid var(--cast-amber);
		min-height: 48px;
	}

	.resource-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.mb-1 {
		margin-bottom: 4px;
	}

	:global(.shimmer) {
		--shimmer-bg: rgba(255, 255, 255, 0.05);
		--shimmer-highlight: rgba(255, 255, 255, 0.1);
	}

	@media (min-width: 768px) {
		.home-canvas {
			gap: 2rem;
			padding: 2.5rem 1.5rem;
		}
	}
</style>
