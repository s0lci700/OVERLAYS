<script lang="ts">
  import type { CharacterRecord } from '$lib/contracts/records';
  import {
    computeAbilityModifier,
    computeSkillTotal,
    SKILL_ABILITY,
    SKILL_LABELS,
    ABILITIES,
    ABILITY_LABELS,
    SKILLS_BY_ABILITY
  } from '$lib/utils/character-derive';
  import CastSectionHeader from '$lib/components/cast/shared/CastSectionHeader.svelte';
  import ProficiencyDot from '$lib/components/cast/shared/ProficiencyDot.svelte';

  let {
    character,
    groupByAbility = true,
    sortByModifier = false
  }: {
    character: CharacterRecord;
    groupByAbility?: boolean;
    sortByModifier?: boolean;
  } = $props();

  const allSkills = $derived(
    Object.entries(SKILL_ABILITY).map(([skill, ability]) => {
      const isProficient = character.skill_proficiencies.includes(skill);
      const isExpertise = character.expertise.includes(skill);
      const abilityMod = computeAbilityModifier(character.ability_scores[ability] ?? 10);
      const total = computeSkillTotal(
        abilityMod,
        isProficient,
        isExpertise,
        character.proficiency_bonus
      );
      const profLevel: 'none' | 'proficient' | 'expertise' = isExpertise
        ? 'expertise'
        : isProficient
          ? 'proficient'
          : 'none';
      return { skill, ability, total, profLevel };
    })
  );

  const displaySkills = $derived(
    sortByModifier ? [...allSkills].sort((a, b) => b.total - a.total) : allSkills
  );

  const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
</script>

<section class="skills-section">
  <CastSectionHeader title="SKILLS" meta="18 TOTAL" />

  <div class="skills-list">
    {#if groupByAbility}
      {#each ABILITIES as ab}
        {#if SKILLS_BY_ABILITY[ab].length > 0}
          <div class="ability-group-header">
            {ABILITY_LABELS[ab]}
          </div>
          {#each displaySkills.filter((s) => s.ability === ab) as s}
            <div class="skill-row" class:is-proficient={s.profLevel !== 'none'}>
              <div class="prof-indicator">
                <ProficiencyDot level={s.profLevel} />
              </div>
              <span class="skill-name">{SKILL_LABELS[s.skill]}</span>
              <span class="skill-ability-hint">{s.ability.toUpperCase()}</span>
              <span class="skill-total">{formatMod(s.total)}</span>
            </div>
          {/each}
        {/if}
      {/each}
    {:else}
      {#each displaySkills as s}
        <div class="skill-row" class:is-proficient={s.profLevel !== 'none'}>
          <div class="prof-indicator">
            <ProficiencyDot level={s.profLevel} />
          </div>
          <span class="skill-name">{SKILL_LABELS[s.skill]}</span>
          <span class="skill-ability-hint">{s.ability.toUpperCase()}</span>
          <span class="skill-total">{formatMod(s.total)}</span>
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  .skills-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background-color: var(--cast-border-subtle);
  }

  .ability-group-header {
    font-family: var(--cast-font-chrome);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--cast-amber);
    background: rgba(200, 148, 74, 0.06);
    padding: 6px 0.75rem;
    margin-top: 1px;
    text-transform: uppercase;
  }

  .skill-row {
    display: grid;
    grid-template-columns: 24px 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    background: rgba(27, 27, 35, 0.6);
    backdrop-filter: blur(var(--cast-blur));
    padding: 0 0.75rem;
    height: 48px;
    border-left: 2px solid transparent;
  }

  .skill-row.is-proficient {
    border-left: 2px solid var(--cast-amber);
  }

  .prof-indicator {
    display: flex;
    justify-content: center;
  }

  .skill-name {
    font-family: var(--cast-font-chrome);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--cast-text-primary);
  }

  .skill-ability-hint {
    font-family: var(--cast-font-chrome);
    font-size: 9px;
    letter-spacing: 0.05em;
    color: rgba(186, 201, 204, 0.4);
    text-transform: uppercase;
  }

  .skill-total {
    font-family: var(--cast-font-data);
    font-weight: 700;
    font-size: 1rem;
    color: var(--cast-text-primary);
    min-width: 2.5rem;
    text-align: right;
  }
</style>
