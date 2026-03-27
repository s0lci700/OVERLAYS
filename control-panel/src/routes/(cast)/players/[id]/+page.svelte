<script lang="ts">
    import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import {
		computeAbilityModifier,
		computeSkillTotal,
		SKILL_ABILITY,
		ABILITIES,
		ABILITY_LABELS
	} from '$lib/utils/character-derive';

    onMount(() => {
        console.log('[PlayerSheet] Mounted with data:', data);
    });
	let { data }: { data: PageData } = $props();
	const character = $derived(data.character);
    
	const modifiers = $derived(
		character
			? Object.fromEntries(
					ABILITIES.map((ab) => [ab, computeAbilityModifier(character.ability_scores[ab] ?? 10)])
				)
			: {}
	);

	const allSkills = $derived(
		character
			? Object.entries(SKILL_ABILITY).map(([skill, ability]) => {
                const isProficient = character.skill_proficiencies.includes(skill);
					const isExpertise = character.expertise.includes(skill);
					return {
						skill,
						ability,
						isProficient,
						isExpertise,
						total: computeSkillTotal(
							modifiers[ability] ?? 0,
							isProficient,
							isExpertise,
							character.proficiency_bonus
						)
					};
				})
			: []
	);

	const signatureSkills = $derived(
		allSkills
			.filter((s) => s.isProficient || s.isExpertise)
			.sort((a, b) => {
				if (a.isExpertise && !b.isExpertise) return -1;
				if (!a.isExpertise && b.isExpertise) return 1;
				return b.total - a.total;
			})
			.slice(0, 5)
	);

	function formatMod(n: number): string {
		return n >= 0 ? `+${n}` : `${n}`;
	}

	function formatSkill(skill: string): string {
		return skill.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

{#if character}
	<div class="home-canvas">
    <div class="character-header">
        <h1 class="character-name">{character.name}</h1>
        <span class="character-meta">
            {character.species} {character.class_name} {character.level}
        </span>
    </div>
		<!-- ── Conditions ──────────────────────────────────────────── -->
		{#if character.conditions.length > 0}
			<div class="conditions-row">
				{#each character.conditions as cond}
					<span class="condition-pill">{cond.condition_name.toUpperCase()}</span>
				{/each}
			</div>
		{/if}

		<!-- ── Stat Strip ──────────────────────────────────────────── -->
		<div class="stat-strip">
			<div class="stat-cell">
				<span class="stat-value">{character.ac_base}</span>
				<span class="stat-label">ARMOR</span>
			</div>
			<div class="stat-cell">
				<span class="stat-value">{character.speed}</span>
				<span class="stat-label">SPEED</span>
			</div>
			<div class="stat-cell">
				<span class="stat-value">{formatMod(modifiers['dex'] ?? 0)}</span>
				<span class="stat-label">INIT</span>
			</div>
			<div class="stat-cell">
				<span class="stat-value">+{character.proficiency_bonus}</span>
				<span class="stat-label">PROF</span>
			</div>
		</div>

		<!-- ── Ability Scores ──────────────────────────────────────── -->
		<section class="ability-section">
			<div class="section-header">
				<h2 class="section-title">ABILITY SCORES</h2>
			</div>
			<div class="ability-grid">
				{#each ABILITIES as ab}
					<div class="ability-cell">
						<span class="ability-label">{ABILITY_LABELS[ab]}</span>
						<span class="ability-mod">{formatMod(modifiers[ab] ?? 0)}</span>
						<span class="ability-score">{character.ability_scores[ab] ?? 10}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ── Resources ──────────────────────────────────────────── -->
		{#if character.resources.length > 0}
			<section class="resources-section">
				<div class="section-header">
					<h2 class="section-title">RESOURCES</h2>
					<span class="section-meta">{character.resources.length} TRACKED</span>
				</div>
				<div class="resources-list">
					{#each character.resources as res}
						{@const pct =
							res.pool_max > 0 ? Math.round((res.pool_current / res.pool_max) * 100) : 0}
						{@const isDepleted = res.pool_current === 0}
						<div class="resource-row {isDepleted ? 'resource-row--depleted' : ''}">
							<div class="resource-info">
								<span class="resource-name">{res.name.toUpperCase()}</span>
								<span class="resource-reset"
									>/ {res.reset_on.replace('_', ' ').toUpperCase()} REST</span
								>
							</div>
							<div class="resource-track">
								<div class="resource-bar" style="width: {pct}%"></div>
							</div>
							<span class="resource-count">{res.pool_current}/{res.pool_max}</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── Signature Skills ────────────────────────────────────── -->
		{#if signatureSkills.length > 0}
			<section class="sig-skills-section">
				<div class="section-header">
					<h2 class="section-title">SIGNATURE SKILLS</h2>
					<span class="section-meta">{signatureSkills.length} PROFICIENT</span>
				</div>
				<div class="sig-skills-list">
					{#each signatureSkills as s}
						<div class="sig-skill-row {s.isExpertise ? 'sig-skill-row--expertise' : ''}">
							<span class="sig-skill-total">{formatMod(s.total)}</span>
							<div class="sig-skill-info">
								<span class="sig-skill-name">{formatSkill(s.skill)}</span>
								<span class="sig-skill-ability">{s.ability.toUpperCase()}</span>
							</div>
							<div class="sig-skill-markers">
								{#if s.isExpertise}
									<span class="cast-triangle-marker"></span>
									<span class="cast-triangle-marker"></span>
								{:else if s.isProficient}
									<span class="cast-triangle-marker"></span>
								{:else}
									<span class="cast-triangle-outline"></span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{:else}
	<div class="home-canvas home-canvas--empty">
		<p class="empty-state">Character not found.</p>
	</div>
{/if}

<style>
	/* ── Canvas ─────────────────────────────────────────────────── */
	.home-canvas {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 640px;
		margin: 0 auto;
	}

	.home-canvas--empty {
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.empty-state {
		font-family: var(--cast-font-chrome);
		font-size: 12px;
		color: var(--cast-text-secondary);
		letter-spacing: 0.1em;
	}

	/* ── Conditions ─────────────────────────────────────────────── */
	.conditions-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.condition-pill {
		padding: 4px 12px;
		border-radius: var(--cast-radius-pill);
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--cast-amber);
		background: var(--cast-amber-dim);
		border: 1px solid rgba(200, 148, 74, 0.3);
	}

	/* ── Stat Strip ─────────────────────────────────────────────── */
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
	}

	.stat-cell:last-child {
		border-right: none;
	}

	.stat-value {
		font-family: var(--cast-font-data);
		font-weight: 700;
		font-size: 1.375rem;
		letter-spacing: 0.05em;
		color: var(--cast-amber-pale);
		line-height: 1;
	}

	.stat-label {
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--cast-text-secondary);
		text-transform: uppercase;
	}

	/* ── Section Header ─────────────────────────────────────────── */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(200, 148, 74, 0.25);
		padding-bottom: 4px;
		margin-bottom: 0.75rem;
	}

	.section-title {
		font-family: var(--cast-font-identity);
		font-weight: 600;
		font-size: 1.125rem;
		letter-spacing: -0.02em;
		color: var(--cast-text-primary);
		margin: 0;
	}

	.section-meta {
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		letter-spacing: 0.1em;
		color: rgba(200, 148, 74, 0.6);
	}

	/* ── Ability Grid ───────────────────────────────────────────── */
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
		padding: 0.75rem 0.5rem;
		gap: 2px;
		background-color: rgba(27, 27, 35, 0.6);
		backdrop-filter: blur(var(--cast-blur));
	}

	.ability-label {
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--cast-amber);
		text-transform: uppercase;
	}

	.ability-mod {
		font-family: var(--cast-font-data);
		font-weight: 700;
		font-size: 1.5rem;
		letter-spacing: 0.02em;
		color: var(--cast-text-primary);
		line-height: 1;
	}

	.ability-score {
		font-family: var(--cast-font-data);
		font-size: 11px;
		color: var(--cast-text-secondary);
	}

	/* ── Resources ──────────────────────────────────────────────── */
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
	}

	.resource-row--depleted {
		border-left-color: transparent;
		opacity: 0.5;
	}

	.resource-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.resource-name {
		font-family: var(--cast-font-chrome);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: var(--cast-text-primary);
	}

	.resource-reset {
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		letter-spacing: 0.05em;
		color: var(--cast-text-secondary);
	}

	.resource-track {
		width: 48px;
		height: 3px;
		background: rgba(255, 255, 255, 0.1);
	}

	.resource-bar {
		height: 100%;
		background: var(--cast-amber);
		transition: width 300ms ease;
	}

	.resource-count {
		font-family: var(--cast-font-data);
		font-size: 12px;
		font-weight: 700;
		color: var(--cast-amber-pale);
		min-width: 2.5rem;
		text-align: right;
	}

	/* ── Signature Skills ───────────────────────────────────────── */
	.sig-skills-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background-color: var(--cast-border-subtle);
	}

	.sig-skill-row {
		display: grid;
		grid-template-columns: 3rem 1fr auto;
		align-items: center;
		gap: 0.75rem;
		background: rgba(27, 27, 35, 0.6);
		backdrop-filter: blur(var(--cast-blur));
		padding: 0 0.75rem;
		height: 52px;
		border-left: 2px solid rgba(200, 148, 74, 0.3);
	}

	.sig-skill-row--expertise {
		border-left-color: var(--cast-amber);
	}

	.sig-skill-total {
		font-family: var(--cast-font-data);
		font-weight: 700;
		font-size: 1.125rem;
		color: var(--cast-text-primary);
		text-align: right;
	}

	.sig-skill-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.sig-skill-name {
		font-family: var(--cast-font-chrome);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--cast-text-primary);
	}

	.sig-skill-ability {
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		letter-spacing: 0.05em;
		color: rgba(186, 201, 204, 0.6);
	}

	.sig-skill-markers {
		display: flex;
		gap: 3px;
		align-items: center;
	}
</style>
