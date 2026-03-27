<script lang="ts">
	import type { PageData } from '../$types';
	import {
		computeAbilityModifier,
		computeSkillTotal,
		SKILL_ABILITY,
		ABILITIES,
		ABILITY_LABELS
	} from '$lib/utils/character-derive';

	let { data }: { data: PageData } = $props();

	const character = $derived(data.character);

	const modifiers = $derived(
		character
			? Object.fromEntries(
					ABILITIES.map((ab) => [
						ab,
						computeAbilityModifier(character.ability_scores[ab] ?? 10)
					])
				)
			: {}
	);

	type SkillEntry = {
		skill: string;
		ability: string;
		abilityLabel: string;
		isProficient: boolean;
		isExpertise: boolean;
		total: number;
	};

	const allSkills = $derived<SkillEntry[]>(
		character
			? Object.entries(SKILL_ABILITY).map(([skill, ability]) => {
					const isProficient = character.skill_proficiencies.includes(skill);
					const isExpertise = character.expertise.includes(skill);
					return {
						skill,
						ability,
						abilityLabel: ABILITY_LABELS[ability] ?? ability.toUpperCase(),
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
				.sort((a, b) => {
					// Expertise first, then proficient, then alphabetical
					if (a.isExpertise && !b.isExpertise) return -1;
					if (!a.isExpertise && b.isExpertise) return 1;
					if (a.isProficient && !b.isProficient) return -1;
					if (!a.isProficient && b.isProficient) return 1;
					return b.total - a.total;
				})
			: []
	);

	// Filter state
	let activeFilter = $state('ALL');
	let searchQuery = $state('');
	let showAll = $state(false);

	const filteredSkills = $derived(() => {
		let skills = allSkills;

		if (activeFilter !== 'ALL') {
			skills = skills.filter((s) => s.ability === activeFilter.toLowerCase());
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			skills = skills.filter((s) => s.skill.replace(/_/g, ' ').includes(q));
		}

		if (!showAll && !searchQuery.trim() && activeFilter === 'ALL') {
			skills = skills.filter((s) => s.isProficient || s.isExpertise);
		}

		return skills;
	});

	const hasHiddenSkills = $derived(
		!showAll && !searchQuery.trim() && activeFilter === 'ALL' &&
		allSkills.some((s) => !s.isProficient && !s.isExpertise)
	);

	const hiddenCount = $derived(
		allSkills.filter((s) => !s.isProficient && !s.isExpertise).length
	);

	const STAT_FILTERS = ['ALL', 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

	function formatSkill(skill: string): string {
		return skill
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatMod(n: number): string {
		return n >= 0 ? `+${n}` : `${n}`;
	}
</script>

{#if character}
	<div class="skills-canvas">
		<!-- ── Search ───────────────────────────────────────────── -->
		<div class="search-bar">
			<span class="material-symbols-outlined search-icon">search</span>
			<input
				class="search-input"
				type="text"
				placeholder="SEARCH SKILLS..."
				bind:value={searchQuery}
			/>
		</div>

		<!-- ── Stat Filter Chips ────────────────────────────────── -->
		<div class="filter-strip cast-no-scrollbar">
			{#each STAT_FILTERS as f}
				<button
					class="filter-chip {activeFilter === f ? 'filter-chip--active' : ''}"
					onclick={() => { activeFilter = f; }}
				>
					{f}
				</button>
			{/each}
		</div>

		<!-- ── Legend ───────────────────────────────────────────── -->
		<div class="proficiency-legend">
			<span class="cast-triangle-marker"></span>
			<span class="legend-label">Proficient</span>
			<span class="cast-triangle-marker" style="margin-left: 6px"></span>
			<span class="cast-triangle-marker" style="margin-left: -6px"></span>
			<span class="legend-label">Expertise</span>
		</div>

		<!-- ── Skill Ledger ─────────────────────────────────────── -->
		<div class="skill-ledger">
			{#each filteredSkills() as s (s.skill)}
				<div
					class="skill-row"
					data-stat={s.ability.toUpperCase()}
					data-name={s.skill}
				>
					<span class="skill-total {s.isExpertise ? 'skill-total--expertise' : s.isProficient ? '' : 'skill-total--dim'}"
						>{formatMod(s.total)}</span>
					<div class="skill-info">
						<span class="skill-name">{formatSkill(s.skill)}</span>
						<span class="skill-ability">{s.abilityLabel}</span>
					</div>
					<div class="skill-markers">
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

			{#if filteredSkills().length === 0}
				<div class="skills-empty">
					<span>NO SKILLS MATCH</span>
				</div>
			{/if}
		</div>

		<!-- ── Show All Toggle ──────────────────────────────────── -->
		{#if hasHiddenSkills}
			<button
				class="show-all-btn"
				onclick={() => { showAll = true; }}
			>
				<span class="material-symbols-outlined" style="font-size: 14px">expand_more</span>
				SHOW {hiddenCount} MORE NON-PROFICIENT
			</button>
		{:else if showAll && activeFilter === 'ALL' && !searchQuery.trim()}
			<button
				class="show-all-btn"
				onclick={() => { showAll = false; }}
			>
				<span class="material-symbols-outlined" style="font-size: 14px">expand_less</span>
				COLLAPSE TO PROFICIENT ONLY
			</button>
		{/if}
	</div>
{:else}
	<div class="skills-canvas">
		<p class="empty-state">Character not found.</p>
	</div>
{/if}

<style>
	.skills-canvas {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 640px;
		margin: 0 auto;
	}

	/* ── Search ───────────────────────────────────────────────── */
	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(27, 27, 35, 0.80);
		border: 1px solid rgba(200, 148, 74, 0.3);
		padding: 0.625rem 1rem;
	}

	.search-icon {
		font-size: 18px;
		color: rgba(200, 148, 74, 0.5);
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-family: var(--cast-font-chrome);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--cast-text-primary);
	}

	.search-input::placeholder {
		color: rgba(240, 240, 240, 0.3);
	}

	/* ── Filter Chips ─────────────────────────────────────────── */
	.filter-strip {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
	}

	.filter-chip {
		flex-shrink: 0;
		padding: 6px 16px;
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.05);
		background: var(--cast-panel-low);
		color: var(--cast-text-secondary);
		transition: all var(--cast-t-press);
	}

	.filter-chip:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.filter-chip--active {
		background: rgba(200, 148, 74, 0.15);
		border-color: rgba(200, 148, 74, 0.4);
		color: var(--cast-amber);
	}

	/* ── Legend ──────────────────────────────────────────────── */
	.proficiency-legend {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 0.25rem;
	}

	.legend-label {
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: rgba(240, 240, 240, 0.4);
		text-transform: uppercase;
		margin-right: 6px;
	}

	/* ── Skill Ledger ─────────────────────────────────────────── */
	.skill-ledger {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background-color: var(--cast-border-subtle);
	}

	.skill-row {
		display: grid;
		grid-template-columns: 3rem 1fr auto;
		align-items: center;
		gap: 0.75rem;
		height: 56px;
		padding: 0 0.75rem;
		background: var(--cast-glass);
		transition: background var(--cast-t-transition);
	}

	.skill-row:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.skill-total {
		font-family: var(--cast-font-data);
		font-weight: 700;
		font-size: 1.125rem;
		color: var(--cast-text-primary);
		text-align: right;
	}

	.skill-total--expertise {
		color: var(--cast-amber-pale);
	}

	.skill-total--dim {
		color: rgba(240, 240, 240, 0.6);
	}

	.skill-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.skill-name {
		font-family: var(--cast-font-chrome);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--cast-text-primary);
	}

	.skill-ability {
		font-family: var(--cast-font-chrome);
		font-size: 9px;
		letter-spacing: 0.05em;
		color: rgba(186, 201, 204, 0.6);
		text-transform: uppercase;
	}

	.skill-markers {
		display: flex;
		gap: 3px;
		align-items: center;
	}

	.skills-empty {
		padding: 2rem;
		text-align: center;
		font-family: var(--cast-font-chrome);
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--cast-text-secondary);
		background: var(--cast-glass);
	}

	/* ── Show All ────────────────────────────────────────────── */
	.show-all-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.75rem;
		font-family: var(--cast-font-chrome);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: rgba(200, 148, 74, 0.6);
		background: transparent;
		border: 1px solid rgba(200, 148, 74, 0.15);
		cursor: pointer;
		transition: all var(--cast-t-transition);
	}

	.show-all-btn:hover {
		color: var(--cast-amber);
		border-color: rgba(200, 148, 74, 0.4);
		background: rgba(200, 148, 74, 0.05);
	}

	.empty-state {
		font-family: var(--cast-font-chrome);
		font-size: 12px;
		color: var(--cast-text-secondary);
		letter-spacing: 0.1em;
		padding: 2rem;
		text-align: center;
	}
</style>
