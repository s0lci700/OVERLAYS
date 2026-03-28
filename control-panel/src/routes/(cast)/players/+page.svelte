<script lang="ts">
	import type { PageData } from './$types';
	import type { CharacterRecord } from '$lib/contracts/records';
	import CastModal from '$lib/components/cast/shared/CastModal.svelte';
	let { data } : { data: PageData } = $props();
		
	let modalOpen = $state(false);
	$effect(() => {
  	if (data.notFoundId) modalOpen = true;
	});

	function hpPercent(c: CharacterRecord) {
		return Math.round((c.hp_current / c.hp_max) * 100);
	}

	function isCritical(c: CharacterRecord) {
		return hpPercent(c) <= 25;
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Noto+Serif:ital,wght@0,600;1,400&family=JetBrains+Mono:wght@700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<CastModal bind:open={modalOpen} title="Personaje no encontrado">
  <p>El personaje con <code>ID: {data.notFoundId}</code> que buscas no está registrado en el archivo.</p>
</CastModal>


<div class="roster">
	<header class="roster-header">
		<span class="roster-label">SELECCIONAR PERSONAJE</span>
		<span class="roster-count">{data.characters.length} EN PARTIDA</span>
	</header>

	{#if data.characters.length === 0}
		<div class="roster-empty">
			<span class="empty-text">Sin personajes registrados.</span>
		</div>
	{:else}
		<ul class="roster-list">
			{#each data.characters as character (character.id)}
				<li>
					<a href="/players/{character.id}" class="character-card" class:is-critical={isCritical(character)}>
						<div class="card-rail"></div>

						<div class="card-body">
							<div class="card-identity">
								<span class="card-name">{character.name}</span>
								<span class="card-meta">
									{character.species?.toUpperCase()} ·
									{character.class_name?.toUpperCase()}
									{#if character.subclass_name}
										<span class="card-subclass">({character.subclass_name})</span>
									{/if}
									· LVL {character.level}
								</span>
							</div>

							<div class="card-stats">
								<span class="card-hp" class:hp-critical={isCritical(character)}>
									{character.hp_current}<span class="hp-sep">/</span>{character.hp_max}
								</span>
								<span class="card-hp-label">HP</span>
							</div>
						</div>

						<div class="card-hp-track">
							<div
								class="card-hp-fill"
								class:fill-critical={isCritical(character)}
								style="width: {hpPercent(character)}%"
							></div>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.roster {
		min-height: 100dvh;
		background: #0d0d15;
		padding: 2.5rem 1.25rem 2rem;
		font-family: 'Space Grotesk', sans-serif;
	}

	/* ── Header ────────────────────────────────────────── */

	.roster-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 2rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid rgba(200, 148, 74, 0.25);
	}

	.roster-label {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		color: #c8944a;
	}

	.roster-count {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: rgba(240, 240, 240, 0.3);
	}

	/* ── States ────────────────────────────────────────── */

	.roster-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 40dvh;
	}

	.empty-text {
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		color: rgba(240, 240, 240, 0.3);
	}

	@keyframes cast-breathe {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}

	/* ── List ──────────────────────────────────────────── */

	.roster-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* ── Character Card ────────────────────────────────── */

	.character-card {
		display: block;
		text-decoration: none;
		position: relative;
		background: rgba(27, 27, 35, 0.6);
		backdrop-filter: blur(40px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-left: none;
		overflow: hidden;
		transition: background 180ms ease, border-color 180ms ease, transform 120ms ease;
	}

	.character-card:hover {
		background: rgba(31, 31, 39, 0.9);
		border-color: rgba(200, 148, 74, 0.2);
	}

	.character-card:active {
		transform: scale(0.985);
	}

	.character-card.is-critical .card-rail {
		animation: cast-breathe 2s ease-in-out infinite;
		background: #ff4444;
	}

	/* Left rail */
	.card-rail {
		position: absolute;
		inset: 0 auto 0 0;
		width: 2px;
		background: #c8944a;
		transition: background 180ms ease;
	}

	.character-card:hover .card-rail {
		background: #e8b060;
	}

	/* Body */
	.card-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1rem 0.75rem 1.25rem;
		gap: 1rem;
	}

	.card-identity {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}

	.card-name {
		font-family: 'Noto Serif', serif;
		font-size: 1.15rem;
		font-weight: 600;
		color: #f0f0f0;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.card-meta {
		font-size: 0.62rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		color: #bac9cc;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-subclass {
		font-style: italic;
		color: rgba(186, 201, 204, 0.6);
		letter-spacing: 0;
		font-size: 0.6rem;
	}

	/* HP stat */
	.card-stats {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.1rem;
		flex-shrink: 0;
	}

	.card-hp {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.3rem;
		font-weight: 700;
		color: #00e5ff;
		letter-spacing: 0.03em;
		line-height: 1;
		transition: color 300ms ease;
	}

	.card-hp.hp-critical {
		color: #ff6b6b;
		animation: cast-breathe 2s ease-in-out infinite;
	}

	.hp-sep {
		color: rgba(0, 229, 255, 0.4);
		font-size: 1rem;
	}

	.card-hp-label {
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		color: rgba(0, 229, 255, 0.4);
	}

	/* HP bar */
	.card-hp-track {
		height: 6px;
		background: rgba(255, 255, 255, 0.05);
		margin-left: 1.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.02);
	}

	.card-hp-fill {
		height: 100%;
		background: rgba(0, 229, 255, 0.6);
		transition: width 400ms ease, background 300ms ease;
		box-shadow: 0 0 8px rgba(0, 229, 255, 0.15);
	}

	.card-hp-fill.fill-critical {
		background: rgba(255, 107, 107, 0.8);
		box-shadow: 0 0 12px rgba(255, 107, 107, 0.25);
	}
</style>
